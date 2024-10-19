import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';

@Injectable()
export class AuditLoggingService extends HealthIndicator {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(AuditLoggingService.name);

  constructor(private configService: ConfigService) {
    super();
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
  }

  async checkHealth(): Promise<HealthIndicatorResult> {
    try {
      const { data, error } = await this.supabase.from('audit_logs').select('id').limit(1);
      if (error) throw error;
      return this.getStatus('audit_logging_db', true, { message: 'Audit Logging DB is healthy' });
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      throw new HealthCheckError('Audit Logging DB check failed', error);
    }
  }

  async logActivity(userId: string, action: string, details: any): Promise<void> {
    try {
      const { error } = await this.supabase.from('audit_logs').insert({
        user_id: userId,
        action,
        details,
        timestamp: new Date().toISOString(),
      });

      if (error) throw new Error(`Failed to log activity: ${error.message}`);
    } catch (error) {
      this.logger.error(`Error logging activity: ${error.message}`);
      throw error;
    }
  }

  async generateAuditTrail(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: true });

      if (error) throw new Error(`Failed to generate audit trail: ${error.message}`);

      return data;
    } catch (error) {
      this.logger.error(`Error generating audit trail: ${error.message}`);
      throw error;
    }
  }

  async createAlert(type: string, message: string, severity: 'low' | 'medium' | 'high'): Promise<void> {
    try {
      const { error } = await this.supabase.from('alerts').insert({
        type,
        message,
        severity,
        timestamp: new Date().toISOString(),
        status: 'open',
      });

      if (error) throw new Error(`Failed to create alert: ${error.message}`);

      // TODO: Implement notification system for high severity alerts
      if (severity === 'high') {
        this.notifyAdmins(type, message);
      }
    } catch (error) {
      this.logger.error(`Error creating alert: ${error.message}`);
      throw error;
    }
  }

  private async notifyAdmins(alertType: string, alertMessage: string): Promise<void> {
    // TODO: Implement admin notification system (e.g., email, SMS, or push notification)
    this.logger.log(`Admin notification: Alert Type - ${alertType}, Message - ${alertMessage}`);
  }
}
