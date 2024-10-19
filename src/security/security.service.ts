import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SecurityService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(SecurityService.name);

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
  }

  async encryptData(data: string): Promise<{ encryptedData: string; iv: string }> {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.configService.get<string>('ENCRYPTION_KEY'), 'salt', 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
    };
  }

  async decryptData(encryptedData: string, iv: string): Promise<string> {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.configService.get<string>('ENCRYPTION_KEY'), 'salt', 32);

    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      Buffer.from(iv, 'hex'),
    );
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async detectThreats(data: any): Promise<boolean> {
    const threatPatterns = [
      /malicious/i,
      /hack/i,
      /exploit/i,
      /\b(drop|delete)\s+table\b/i,
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
}
