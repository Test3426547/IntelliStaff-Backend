import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import NodeCache from 'node-cache';
import { CommonUtils } from '../common/common-utils';

@Injectable()
export class UserManagementService extends HealthIndicator {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(UserManagementService.name);
  private userCache: NodeCache;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService
  ) {
    super();
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.userCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
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

    const hashedPassword = await bcrypt.hash(password, 10);

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
      if (cachedUser) {
        return cachedUser;
      }

      const { data: { user }, error } = await this.supabase.auth.getUser(token);
      if (error) throw new UnauthorizedException(`Failed to get user: ${error.message}`);

      const role = await this.getUserRole(user.id);
      const userData = { ...user, role };

      this.userCache.set(token, userData);

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
        .update({ is_locked: true, locked_until: new Date(Date.now() + 30 * 60 * 1000) })
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

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      this.logger.error(`Error checking permission: ${error.message}`);
      return false;
    }

    if (!data || data.length === 0) {
      return false;
    }

    const roles = data.map(item => item.role);
    const { data: roleData, error: roleError } = await this.supabase
      .from('roles')
      .select('permissions')
      .in('name', roles);

    if (roleError) {
      this.logger.error(`Error fetching role permissions: ${roleError.message}`);
      return false;
    }

    return roleData.some(role => 
      role.permissions && Array.isArray(role.permissions) && role.permissions.includes(permission)
    );
  }

  startCacheCleanup(): void {
    setInterval(() => {
      this.logger.log('Starting cache cleanup');
      this.userCache.flushAll();
      this.logger.log('Cache cleanup completed');
    }, 600000); // Run every 10 minutes
  }

  async resetPassword(email: string): Promise<void> {
    this.logger.log(`Password reset requested for email: ${email}`);
    // Implement password reset logic
    // Send password reset email
  }

  async confirmResetPassword(token: string, newPassword: string): Promise<void> {
    this.logger.log(`Confirming password reset for token: ${token}`);
    // Implement password reset confirmation logic
    // Verify token and update password
  }

  async assignRole(userId: string, role: string): Promise<void> {
    this.logger.log(`Assigning role ${role} to user ${userId}`);
    // Implement role assignment logic
    // Update user's role in the database
  }

  async getRoles(): Promise<string[]> {
    this.logger.log('Fetching all roles');
    // Implement get roles logic
    // Fetch and return all available roles
    return ['admin', 'user', 'manager']; // Example roles
  }

  async createRole(roleName: string): Promise<void> {
    this.logger.log(`Creating new role: ${roleName}`);
    // Implement create role logic
    // Add new role to the database
  }

  async deleteRole(roleName: string): Promise<void> {
    this.logger.log(`Deleting role: ${roleName}`);
    // Implement delete role logic
    // Remove role from the database
  }

  async getUsersWithRole(role: string): Promise<any[]> {
    this.logger.log(`Fetching users with role: ${role}`);
    // Implement get users with role logic
    // Fetch and return users with the specified role
    return []; // Placeholder
  }

  async addPermissionToRole(roleName: string, permission: string): Promise<void> {
    this.logger.log(`Adding permission ${permission} to role ${roleName}`);
    // Implement add permission to role logic
    // Add permission to the specified role in the database
  }

  async removePermissionFromRole(roleName: string, permission: string): Promise<void> {
    this.logger.log(`Removing permission ${permission} from role ${roleName}`);
    // Implement remove permission from role logic
    // Remove permission from the specified role in the database
  }
}