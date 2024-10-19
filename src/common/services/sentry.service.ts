import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SentryService {
  constructor(private configService: ConfigService) {
    Sentry.init({
      dsn: this.configService.get<string>('SENTRY_DSN'),
      environment: this.configService.get<string>('NODE_ENV') || 'development',
    });
  }

  captureException(exception: any): void {
    Sentry.captureException(exception);
  }

  captureMessage(message: string, level: Sentry.Severity = Sentry.Severity.Info): void {
    Sentry.captureMessage(message, level);
  }

  setExtra(key: string, value: any): void {
    Sentry.setExtra(key, value);
  }

  setTag(key: string, value: string): void {
    Sentry.setTag(key, value);
  }

  setUser(user: { id: string; email?: string; username?: string }): void {
    Sentry.setUser(user);
  }
}
