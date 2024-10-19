import { Injectable, Logger, InternalServerErrorException, UnauthorizedException, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { retry } from 'rxjs/operators';
import { from, throwError } from 'rxjs';

@Injectable()
export class UserManagementService extends HealthIndicator {
  private supabase: SupabaseClient;
  private loginRateLimiter: RateLimiterMemory;
  private readonly logger = new Logger(UserManagementService.name);
  private userCache: Map<string, any> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes in milliseconds

  constructor(private configService: ConfigService) {
    super();
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.initializeRateLimiter();
  }

  private initializeRateLimiter() {
    this.loginRateLimiter = new RateLimiterMemory({
      points: 5,
      duration: 60 * 15, // 15 minutes
    });
  }

  async checkHealth(): Promise<HealthIndicatorResult> {
    try {
      const { data, error } = await this.supabase.from('users').select('id').limit(1);
      if (error) throw error;
      return this.getStatus('user_management_db', true, { message: 'User Management DB is healthy' });
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      throw new HealthCheckError('User Management DB check failed', error);
    }
  }

  private async retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    return from(operation()).pipe(
      retry({
        count: maxRetries,
        delay: (error, retryCount) => {
          this.logger.warn(`Retrying operation. Attempt ${retryCount} of ${maxRetries}`);
          return Math.pow(2, retryCount) * 1000; // Exponential backoff
        }
      })
    ).toPromise();
  }

  async register(email: string, password: string, role: string = 'user'): Promise<any> {
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (!this.isStrongPassword(password)) {
      throw new BadRequestException('Password does not meet strength requirements');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    return this.retryOperation(async () => {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password: hashedPassword,
      });

      if (error) throw new BadRequestException(`Registration failed: ${error.message}`);

      // Add user role to the database
      await this.supabase.from('user_roles').insert({ user_id: data.user.id, role });

      return { user: data.user, message: 'Registration successful. Please check your email to confirm your account.' };
    });
  }

  async login(email: string, password: string, twoFactorToken?: string): Promise<any> {
    return this.executeWithRetry(async () => {
      try {
        await this.loginRateLimiter.consume(email);
      } catch (error) {
        throw new ConflictException('Too many login attempts. Please try again later.');
      }

      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !user) {
        await this.incrementLoginAttempts(email);
        throw new UnauthorizedException('Invalid credentials');
      }

      if (user.is_locked && new Date(user.locked_until) > new Date()) {
        throw new UnauthorizedException('Account is locked. Please try again later.');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await this.incrementLoginAttempts(user.id);
        throw new UnauthorizedException('Invalid credentials');
      }

      if (user.two_factor_enabled) {
        if (!twoFactorToken) {
          throw new UnauthorizedException('Two-factor authentication token required');
        }
        const isValid = this.verify2FAToken(user.two_factor_secret, twoFactorToken);
        if (!isValid) {
          throw new UnauthorizedException('Invalid two-factor authentication token');
        }
      }

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new UnauthorizedException(`Login failed: ${error.message}`);

      await this.resetLoginAttempts(user.id);

      const role = await this.getUserRole(data.user.id);
      const refreshToken = this.generateRefreshToken();
      await this.storeRefreshToken(data.user.id, refreshToken);

      return { ...data, role, refreshToken };
    });
  }

  async logout(token: string): Promise<void> {
    return this.executeWithRetry(async () => {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw new UnauthorizedException(`Logout failed: ${error.message}`);

      // Revoke the token
      await this.revokeToken(token);
    });
  }

  async getUser(token: string): Promise<any> {
    return this.executeWithRetry(async () => {
      // Check cache first
      const cachedUser = this.userCache.get(token);
      if (cachedUser && cachedUser.expiry > Date.now()) {
        return cachedUser.user;
      }

      const { data: { user }, error } = await this.supabase.auth.getUser(token);
      if (error) throw new UnauthorizedException(`Failed to get user: ${error.message}`);

      const role = await this.getUserRole(user.id);
      const userData = { ...user, role };

      // Cache the user data
      this.userCache.set(token, {
        user: userData,
        expiry: Date.now() + this.CACHE_TTL
      });

      return userData;
    });
  }

  async refreshToken(refreshToken: string): Promise<any> {
    return this.executeWithRetry(async () => {
      const { data, error } = await this.supabase.auth.refreshSession({ refresh_token: refreshToken });
      if (error) throw new UnauthorizedException(`Token refresh failed: ${error.message}`);

      const newRefreshToken = this.generateRefreshToken();
      await this.rotateRefreshToken(data.user.id, refreshToken, newRefreshToken);

      return { ...data, refreshToken: newRefreshToken };
    });
  }

  async resetPassword(email: string): Promise<void> {
    return this.executeWithRetry(async () => {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // Token valid for 1 hour

      const { error } = await this.supabase
        .from('password_reset_tokens')
        .insert({ email, token: resetToken, expires_at: resetTokenExpiry });

      if (error) throw new BadRequestException(`Password reset failed: ${error.message}`);

      // Send password reset email with the token
      // TODO: Implement email sending functionality
      console.log(`Password reset token for ${email}: ${resetToken}`);
    });
  }

  async confirmResetPassword(token: string, newPassword: string): Promise<void> {
    return this.executeWithRetry(async () => {
      const { data, error } = await this.supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !data) throw new BadRequestException('Invalid or expired reset token');

      if (new Date(data.expires_at) < new Date()) {
        throw new BadRequestException('Reset token has expired');
      }

      if (!this.isStrongPassword(newPassword)) {
        throw new BadRequestException('Password does not meet strength requirements');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      const { error: updateError } = await this.supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('email', data.email);

      if (updateError) throw new BadRequestException(`Password reset failed: ${updateError.message}`);

      // Delete the used reset token
      await this.supabase
        .from('password_reset_tokens')
        .delete()
        .eq('token', token);
    });
  }

  async enable2FA(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    return this.executeWithRetry(async () => {
      const secret = speakeasy.generateSecret({ length: 32 });
      const otpauthUrl = speakeasy.otpauthURL({
        secret: secret.base32,
        label: this.configService.get<string>('APP_NAME'),
        issuer: this.configService.get<string>('APP_NAME'),
      });

      const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

      await this.supabase
        .from('users')
        .update({ two_factor_secret: secret.base32, two_factor_enabled: true })
        .eq('id', userId);

      return { secret: secret.base32, qrCodeUrl };
    });
  }

  verify2FAToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isStrongPassword(password: string): boolean {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    return strongPasswordRegex.test(password);
  }

  private async incrementLoginAttempts(userId: string): Promise<void> {
    return this.executeWithRetry(async () => {
      const { data, error } = await this.supabase
        .from('users')
        .select('login_attempts')
        .eq('id', userId)
        .single();

      if (error) throw new Error(`Failed to get login attempts: ${error.message}`);

      const newAttempts = (data.login_attempts || 0) + 1;

      await this.supabase
        .from('users')
        .update({ login_attempts: newAttempts })
        .eq('id', userId);

      if (newAttempts >= 5) {
        await this.lockAccount(userId);
      }
    });
  }

  private async resetLoginAttempts(userId: string): Promise<void> {
    return this.executeWithRetry(async () => {
      await this.supabase
        .from('users')
        .update({ login_attempts: 0 })
        .eq('id', userId);
    });
  }

  private async lockAccount(userId: string): Promise<void> {
    return this.executeWithRetry(async () => {
      await this.supabase
        .from('users')
        .update({ is_locked: true, locked_until: new Date(Date.now() + 30 * 60 * 1000) }) // Lock for 30 minutes
        .eq('id', userId);
    });
  }

  private async getUserRole(userId: string): Promise<string> {
    return this.executeWithRetry(async () => {
      const { data, error } = await this.supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) throw new Error(`Failed to get user role: ${error.message}`);
      return data.role;
    });
  }

  private async revokeToken(token: string): Promise<void> {
    return this.executeWithRetry(async () => {
      await this.supabase
        .from('revoked_tokens')
        .insert({ token, revoked_at: new Date().toISOString() });
    });
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    return this.executeWithRetry(async () => {
      await this.supabase
        .from('refresh_tokens')
        .insert({ user_id: userId, token: refreshToken, created_at: new Date().toISOString() });
    });
  }

  private async rotateRefreshToken(userId: string, oldToken: string, newToken: string): Promise<void> {
    return this.executeWithRetry(async () => {
      await this.supabase
        .from('refresh_tokens')
        .update({ token: newToken, created_at: new Date().toISOString() })
        .match({ user_id: userId, token: oldToken });
    });
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    return this.retryOperation(operation);
  }

  private clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.userCache.entries()) {
      if (value.expiry <= now) {
        this.userCache.delete(key);
      }
    }
  }

  startCacheCleanup() {
    setInterval(() => this.clearExpiredCache(), this.CACHE_TTL);
  }
}