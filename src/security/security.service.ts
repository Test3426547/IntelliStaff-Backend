import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import * as argon2 from 'argon2';

@Injectable()
export class SecurityService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(SecurityService.name);
  private readonly encryptionKey: Buffer;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    const encryptionKeyString = this.configService.get<string>('ENCRYPTION_KEY');
    if (!encryptionKeyString) {
      throw new Error('ENCRYPTION_KEY is not defined in the environment');
    }
    this.encryptionKey = Buffer.from(encryptionKeyString, 'hex');
  }

  async encryptData(data: string): Promise<{ encryptedData: string; iv: string }> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
    };
  }

  async decryptData(encryptedData: string, iv: string): Promise<string> {
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      this.encryptionKey,
      Buffer.from(iv, 'hex'),
    );
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  async detectThreats(data: any): Promise<boolean> {
    const threatPatterns = [
      /malicious/i,
      /hack/i,
      /exploit/i,
      /\b(drop|delete)\s+table\b/i,
      /\b(union|select)\s+.*\bfrom\b/i,
      /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
    ];

    const dataString = JSON.stringify(data);
    return threatPatterns.some(pattern => pattern.test(dataString));
  }

  async logSecurityEvent(userId: string, event: string, details: any): Promise<void> {
    try {
      const { error } = await this.supabase.from('security_logs').insert({
        user_id: userId,
        event,
        details,
        timestamp: new Date().toISOString(),
        ip_address: details.ip_address || null,
        user_agent: details.user_agent || null,
      });

      if (error) throw new Error(`Failed to log security event: ${error.message}`);

      this.logger.log(`Security event logged: ${event} for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error logging security event: ${error.message}`);
      throw error;
    }
  }

  async getSecurityLogs(page: number = 1, limit: number = 50): Promise<{ logs: any[], total: number }> {
    try {
      const { data, error, count } = await this.supabase
        .from('security_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw new Error(`Failed to fetch security logs: ${error.message}`);

      return { logs: data, total: count };
    } catch (error) {
      this.logger.error(`Error fetching security logs: ${error.message}`);
      throw error;
    }
  }

  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  async revokeToken(token: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('revoked_tokens')
        .insert({ token, revoked_at: new Date().toISOString() });

      if (error) throw new Error(`Failed to revoke token: ${error.message}`);

      this.logger.log(`Token revoked: ${token}`);
    } catch (error) {
      this.logger.error(`Error revoking token: ${error.message}`);
      throw error;
    }
  }

  async isTokenRevoked(token: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('revoked_tokens')
        .select('revoked_at')
        .eq('token', token)
        .single();

      if (error) throw new Error(`Failed to check token revocation: ${error.message}`);

      return !!data;
    } catch (error) {
      this.logger.error(`Error checking token revocation: ${error.message}`);
      throw error;
    }
  }

  async rotateApiKey(userId: string): Promise<string> {
    try {
      const newApiKey = this.generateSecureToken(48);
      const hashedApiKey = await this.hashPassword(newApiKey);

      const { error } = await this.supabase
        .from('api_keys')
        .update({ api_key: hashedApiKey, last_rotated: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw new Error(`Failed to rotate API key: ${error.message}`);

      this.logger.log(`API key rotated for user ${userId}`);
      await this.logSecurityEvent(userId, 'api_key_rotated', { timestamp: new Date().toISOString() });

      return newApiKey;
    } catch (error) {
      this.logger.error(`Error rotating API key: ${error.message}`);
      throw error;
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('api_keys')
        .select('api_key')
        .single();

      if (error) throw new Error(`Failed to fetch API key: ${error.message}`);

      return this.validatePassword(apiKey, data.api_key);
    } catch (error) {
      this.logger.error(`Error validating API key: ${error.message}`);
      throw error;
    }
  }
}
