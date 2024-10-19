import { Injectable, Logger, InternalServerErrorException, UnauthorizedException, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { retry } from 'rxjs/operators';
import { from, throwError } from 'rxjs';
import { CommonUtils } from '../common/common-utils';

@Injectable()
export class UserManagementService extends HealthIndicator {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(UserManagementService.name);
  private userCache: Map<string, any> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes in milliseconds

  constructor(private configService: ConfigService) {
    super();
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
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
    return CommonUtils.retryOperation(operation, maxRetries);
  }

  async register(email: string, password: string, role: string = 'user'): Promise<any> {
    if (!CommonUtils.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (!CommonUtils.isStrongPassword(password)) {
      throw new BadRequestException('Password does not meet strength requirements');
    }

    const hashedPassword = await CommonUtils.hashPassword(password);

    return this.retryOperation(async () => {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password: hashedPassword,
      });

      if (error) throw new BadRequestException(`Registration failed: ${error.message}`);

      await this.supabase.from('user_roles').insert({ user_id: data.user.id, role });

      return { user: data.user, message: 'Registration successful. Please check your email to confirm your account.' };
    });
  }

  async login(email: string, password: string, twoFactorToken?: string): Promise<any> {
    return this.retryOperation(async () => {
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (user.is_locked && new Date(user.locked_until) > new Date()) {
        throw new UnauthorizedException('Account is locked. Please try again later.');
      }

      const isPasswordValid = await CommonUtils.comparePassword(password, user.password);
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
      const refreshToken = CommonUtils.generateRandomString(40);
      await this.storeRefreshToken(data.user.id, refreshToken);

      return { ...data, role, refreshToken };
    });
  }

  async logout(token: string): Promise<void> {
    return this.retryOperation(async () => {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw new UnauthorizedException(`Logout failed: ${error.message}`);

      await this.revokeToken(token);
    });
  }

  async getUser(token: string): Promise<any> {
    return this.retryOperation(async () => {
      const cachedUser = this.userCache.get(token);
      if (cachedUser && cachedUser.expiry > Date.now()) {
        return cachedUser.user;
      }

      const { data: { user }, error } = await this.supabase.auth.getUser(token);
      if (error) throw new UnauthorizedException(`Failed to get user: ${error.message}`);

      const role = await this.getUserRole(user.id);
      const userData = { ...user, role };

      this.userCache.set(token, {
        user: userData,
        expiry: Date.now() + this.CACHE_TTL
      });

      return userData;
    });
  }

  async refreshToken(refreshToken: string): Promise<any> {
    return this.retryOperation(async () => {
      const { data, error } = await this.supabase.auth.refreshSession({ refresh_token: refreshToken });
      if (error) throw new UnauthorizedException(`Token refresh failed: ${error.message}`);

      const newRefreshToken = CommonUtils.generateRandomString(40);
      await this.rotateRefreshToken(data.user.id, refreshToken, newRefreshToken);

      return { ...data, refreshToken: newRefreshToken };
    });
  }

  async resetPassword(email: string): Promise<void> {
    return this.retryOperation(async () => {
      const resetToken = CommonUtils.generateRandomString(32);
      const resetTokenExpiry = new Date(Date.now() + 3600000); // Token valid for 1 hour

      const { error } = await this.supabase
        .from('password_reset_tokens')
        .insert({ email, token: resetToken, expires_at: resetTokenExpiry });

      if (error) throw new BadRequestException(`Password reset failed: ${error.message}`);

      console.log(`Password reset token for ${email}: ${resetToken}`);
    });
  }

  async confirmResetPassword(token: string, newPassword: string): Promise<void> {
    return this.retryOperation(async () => {
      const { data, error } = await this.supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !data) throw new BadRequestException('Invalid or expired reset token');

      if (new Date(data.expires_at) < new Date()) {
        throw new BadRequestException('Reset token has expired');
      }

      if (!CommonUtils.isStrongPassword(newPassword)) {
        throw new BadRequestException('Password does not meet strength requirements');
      }

      const hashedPassword = await CommonUtils.hashPassword(newPassword);

      const { error: updateError } = await this.supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('email', data.email);

      if (updateError) throw new BadRequestException(`Password reset failed: ${updateError.message}`);

      await this.supabase
        .from('password_reset_tokens')
        .delete()
        .eq('token', token);
    });
  }

  async enable2FA(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    return this.retryOperation(async () => {
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

  private async incrementLoginAttempts(userId: string): Promise<void> {
    return this.retryOperation(async () => {
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
    return this.retryOperation(async () => {
      await this.supabase
        .from('users')
        .update({ login_attempts: 0 })
        .eq('id', userId);
    });
  }

  private async lockAccount(userId: string): Promise<void> {
    return this.retryOperation(async () => {
      await this.supabase
        .from('users')
        .update({ is_locked: true, locked_until: new Date(Date.now() + 30 * 60 * 1000) }) // Lock for 30 minutes
        .eq('id', userId);
    });
  }

  private async getUserRole(userId: string): Promise<string> {
    return this.retryOperation(async () => {
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
    return this.retryOperation(async () => {
      await this.supabase
        .from('revoked_tokens')
        .insert({ token, revoked_at: new Date().toISOString() });
    });
  }

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    return this.retryOperation(async () => {
      await this.supabase
        .from('refresh_tokens')
        .insert({ user_id: userId, token: refreshToken, created_at: new Date().toISOString() });
    });
  }

  private async rotateRefreshToken(userId: string, oldToken: string, newToken: string): Promise<void> {
    return this.retryOperation(async () => {
      await this.supabase
        .from('refresh_tokens')
        .update({ token: newToken, created_at: new Date().toISOString() })
        .match({ user_id: userId, token: oldToken });
    });
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

  // New methods for RBAC

  async assignRole(userId: string, role: string): Promise<void> {
    return this.retryOperation(async () => {
      const { error } = await this.supabase
        .from('user_roles')
        .upsert({ user_id: userId, role }, { onConflict: 'user_id' });

      if (error) throw new Error(`Failed to assign role: ${error.message}`);
    });
  }

  async getRoles(): Promise<string[]> {
    return this.retryOperation(async () => {
      const { data, error } = await this.supabase
        .from('roles')
        .select('name');

      if (error) throw new Error(`Failed to get roles: ${error.message}`);
      return data.map(role => role.name);
    });
  }

  async createRole(roleName: string): Promise<void> {
    return this.retryOperation(async () => {
      const { error } = await this.supabase
        .from('roles')
        .insert({ name: roleName });

      if (error) throw new Error(`Failed to create role: ${error.message}`);
    });
  }

  async deleteRole(roleName: string): Promise<void> {
    return this.retryOperation(async () => {
      const { error } = await this.supabase
        .from('roles')
        .delete()
        .eq('name', roleName);

      if (error) throw new Error(`Failed to delete role: ${error.message}`);
    });
  }

  async getUsersWithRole(role: string): Promise<any[]> {
    return this.retryOperation(async () => {
      const { data, error } = await this.supabase
        .from('user_roles')
        .select('users(*)')
        .eq('role', role);

      if (error) throw new Error(`Failed to get users with role: ${error.message}`);
      return data.map(item => item.users);
    });
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    return this.retryOperation(async () => {
      const { data, error } = await this.supabase
        .from('user_roles')
        .select('roles(permissions)')
        .eq('user_id', userId)
        .single();

      if (error) throw new Error(`Failed to check permission: ${error.message}`);
      return data.roles.permissions.includes(permission);
    });
  }

  async addPermissionToRole(roleName: string, permission: string): Promise<void> {
    return this.retryOperation(async () => {
      const { data, error } = await this.supabase
        .from('roles')
        .select('permissions')
        .eq('name', roleName)
        .single();

      if (error) throw new Error(`Failed to get role permissions: ${error.message}`);

      const updatedPermissions = [...new Set([...data.permissions, permission])];

      const { error: updateError } = await this.supabase
        .from('roles')
        .update({ permissions: updatedPermissions })
        .eq('name', roleName);

      if (updateError) throw new Error(`Failed to add permission to role: ${updateError.message}`);
    });
  }

  async removePermissionFromRole(roleName: string, permission: string): Promise<void> {
    return this.retryOperation(async () => {
      const { data, error } = await this.supabase
        .from('roles')
        .select('permissions')
        .eq('name', roleName)
        .single();

      if (error) throw new Error(`Failed to get role permissions: ${error.message}`);

      const updatedPermissions = data.permissions.filter(p => p !== permission);

      const { error: updateError } = await this.supabase
        .from('roles')
        .update({ permissions: updatedPermissions })
        .eq('name', roleName);

      if (updateError) throw new Error(`Failed to remove permission from role: ${updateError.message}`);
    });
  }
}
