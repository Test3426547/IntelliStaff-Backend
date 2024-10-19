import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import * as crypto from 'crypto';

@Injectable()
export class SecurityService extends HealthIndicator {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(SecurityService.name);

  constructor(private configService: ConfigService) {
    super();
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
  }

  async checkHealth(): Promise<HealthIndicatorResult> {
    try {
      const { data, error } = await this.supabase.from('security_logs').select('id').limit(1);
      if (error) throw error;
      return this.getStatus('security_service_db', true, { message: 'Security Service DB is healthy' });
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      throw new HealthCheckError('Security Service DB check failed', error);
    }
  }

  // Encryption methods
  encrypt(text: string, key: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  decrypt(text: string, key: string): string {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  // Security policy methods
  async createSecurityPolicy(policy: any): Promise<void> {
    try {
      const { error } = await this.supabase.from('security_policies').insert(policy);
      if (error) throw new Error(`Failed to create security policy: ${error.message}`);
    } catch (error) {
      this.logger.error(`Error creating security policy: ${error.message}`);
      throw error;
    }
  }

  async getSecurityPolicies(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.from('security_policies').select('*');
      if (error) throw new Error(`Failed to fetch security policies: ${error.message}`);
      return data;
    } catch (error) {
      this.logger.error(`Error fetching security policies: ${error.message}`);
      throw error;
    }
  }

  // Threat detection methods
  async detectThreats(data: any): Promise<any> {
    // Implement threat detection logic here
    // This is a placeholder implementation
    const threats = [];
    if (data.includes('malicious')) {
      threats.push('Potential malicious content detected');
    }
    if (data.includes('sql injection')) {
      threats.push('Potential SQL injection attempt detected');
    }
    return threats;
  }

  async logSecurityEvent(event: any): Promise<void> {
    try {
      const { error } = await this.supabase.from('security_logs').insert(event);
      if (error) throw new Error(`Failed to log security event: ${error.message}`);
    } catch (error) {
      this.logger.error(`Error logging security event: ${error.message}`);
      throw error;
    }
  }
}
