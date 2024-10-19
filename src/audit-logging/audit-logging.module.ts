import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuditLoggingService } from './audit-logging.service';
import { AuditLoggingController } from './audit-logging.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [ConfigModule, TerminusModule],
  providers: [AuditLoggingService],
  controllers: [AuditLoggingController],
  exports: [AuditLoggingService],
})
export class AuditLoggingModule {}
