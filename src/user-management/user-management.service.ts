import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserManagementService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
  }

  async register(email: string, password: string, role: string = 'user'): Promise<any> {
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (!this.isStrongPassword(password)) {
      throw new BadRequestException('Password does not meet strength requirements');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password: hashedPassword,
    });

    if (error) throw new BadRequestException(`Registration failed: ${error.message}`);

    // Add user role to the database
    await this.supabase.from('user_roles').insert({ user_id: data.user.id, role });

    return { user: data.user, message: 'Registration successful. Please check your email to confirm your account.' };
  }

  async login(email: string, password: string): Promise<any> {
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.incrementLoginAttempts(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new UnauthorizedException(`Login failed: ${error.message}`);

    await this.resetLoginAttempts(user.id);

    const role = await this.getUserRole(data.user.id);
    return { ...data, role };
  }

  async logout(token: string): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw new UnauthorizedException(`Logout failed: ${error.message}`);

    // Revoke the token
    await this.revokeToken(token);
  }

  async getUser(token: string): Promise<any> {
    const { data: { user }, error } = await this.supabase.auth.getUser(token);
    if (error) throw new UnauthorizedException(`Failed to get user: ${error.message}`);

    const role = await this.getUserRole(user.id);
    return { ...user, role };
  }

  async refreshToken(refreshToken: string): Promise<any> {
    const { data, error } = await this.supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error) throw new UnauthorizedException(`Token refresh failed: ${error.message}`);
    return data;
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) throw new BadRequestException(`Password reset failed: ${error.message}`);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isStrongPassword(password: string): boolean {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  private async incrementLoginAttempts(userId: string): Promise<void> {
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
  }

  private async resetLoginAttempts(userId: string): Promise<void> {
    await this.supabase
      .from('users')
      .update({ login_attempts: 0 })
      .eq('id', userId);
  }

  private async lockAccount(userId: string): Promise<void> {
    await this.supabase
      .from('users')
      .update({ is_locked: true, locked_until: new Date(Date.now() + 30 * 60 * 1000) }) // Lock for 30 minutes
      .eq('id', userId);
  }

  private async getUserRole(userId: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) throw new Error(`Failed to get user role: ${error.message}`);
    return data.role;
  }

  private async revokeToken(token: string): Promise<void> {
    await this.supabase
      .from('revoked_tokens')
      .insert({ token, revoked_at: new Date().toISOString() });
  }
}
