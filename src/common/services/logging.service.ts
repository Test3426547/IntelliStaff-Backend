import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class LoggingService implements LoggerService {
  private readonly logger = new Logger(LoggingService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
  }

  log(message: string, context?: string) {
    this.logger.log(message, context);
    this.saveLog('info', message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, trace, context);
    this.saveLog('error', message, context, trace);
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context);
    this.saveLog('warn', message, context);
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, context);
    this.saveLog('debug', message, context);
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, context);
    this.saveLog('verbose', message, context);
  }

  private async saveLog(level: string, message: string, context?: string, trace?: string) {
    try {
      const { error } = await this.supabase.from('application_logs').insert({
        level,
        message,
        context,
        trace,
        timestamp: new Date().toISOString(),
      });

      if (error) {
        this.logger.error(`Failed to save log to Supabase: ${error.message}`);
      }
    } catch (error) {
      this.logger.error(`Error saving log to Supabase: ${error.message}`);
    }
  }
}
