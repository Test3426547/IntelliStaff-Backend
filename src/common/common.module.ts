import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SentryService } from './services/sentry.service';
import { LoggingService } from './services/logging.service';

@Module({
  imports: [ConfigModule],
  providers: [SentryService, LoggingService],
  exports: [SentryService, LoggingService],
})
export class CommonModule {}
