import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class ErrorHandlingMonitoringService extends HealthIndicator implements OnModuleInit {
  private readonly logger = new Logger(ErrorHandlingMonitoringService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    super();
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
  }

  onModuleInit() {
    Sentry.init({
      dsn: this.configService.get<string>('SENTRY_DSN'),
      environment: this.configService.get<string>('NODE_ENV') || 'development',
    });
  }

  async checkHealth(): Promise<HealthIndicatorResult> {
    try {
      const { data, error } = await this.supabase.from('error_logs').select('id').limit(1);
      if (error) throw error;
      return this.getStatus('error_handling_monitoring_db', true, { message: 'Error Handling and Monitoring DB is healthy' });
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      throw new HealthCheckError('Error Handling and Monitoring DB check failed', error);
    }
  }

  captureException(error: Error, context?: any) {
    Sentry.captureException(error, { extra: context });
    this.logError(error, context);
  }

  captureMessage(message: string, level: Sentry.Severity = Sentry.Severity.Info, context?: any) {
    Sentry.captureMessage(message, level);
    this.logMessage(message, level, context);
  }

  async getErrorLogs(page: number = 1, limit: number = 10): Promise<any> {
    try {
      const { data, error, count } = await this.supabase
        .from('error_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw new Error(`Failed to fetch error logs: ${error.message}`);

      return { logs: data, total: count };
    } catch (error) {
      this.logger.error(`Error fetching error logs: ${error.message}`);
      throw error;
    }
  }

  async getPerformanceMetrics(startDate: Date, endDate: Date): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: true });

      if (error) throw new Error(`Failed to fetch performance metrics: ${error.message}`);

      return data;
    } catch (error) {
      this.logger.error(`Error fetching performance metrics: ${error.message}`);
      throw error;
    }
  }

  async recordPerformanceMetric(metricName: string, value: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('performance_metrics')
        .insert({
          metric_name: metricName,
          value,
          timestamp: new Date().toISOString(),
        });

      if (error) throw new Error(`Failed to record performance metric: ${error.message}`);
    } catch (error) {
      this.logger.error(`Error recording performance metric: ${error.message}`);
      throw error;
    }
  }

  private async logError(error: Error, context?: any): Promise<void> {
    try {
      const { error: dbError } = await this.supabase
        .from('error_logs')
        .insert({
          message: error.message,
          stack: error.stack,
          context: JSON.stringify(context),
          timestamp: new Date().toISOString(),
        });

      if (dbError) throw new Error(`Failed to log error: ${dbError.message}`);
    } catch (logError) {
      this.logger.error(`Error logging to database: ${logError.message}`);
    }
  }

  private async logMessage(message: string, level: Sentry.Severity, context?: any): Promise<void> {
    try {
      const { error: dbError } = await this.supabase
        .from('message_logs')
        .insert({
          message,
          level: level.toString(),
          context: JSON.stringify(context),
          timestamp: new Date().toISOString(),
        });

      if (dbError) throw new Error(`Failed to log message: ${dbError.message}`);
    } catch (logError) {
      this.logger.error(`Error logging message to database: ${logError.message}`);
    }
  }
}
