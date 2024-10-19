import { Module } from '@nestjs/common';
import { AuditLoggingService } from './audit-logging.service';
import { AuditLoggingController } from './audit-logging.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AuditLoggingService],
  controllers: [AuditLoggingController],
  exports: [AuditLoggingService],
})
export class AuditLoggingModule {}
