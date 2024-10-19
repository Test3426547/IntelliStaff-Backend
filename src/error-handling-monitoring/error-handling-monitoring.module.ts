import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ErrorHandlingMonitoringService } from './error-handling-monitoring.service';
import { ErrorHandlingMonitoringController } from './error-handling-monitoring.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [ConfigModule, TerminusModule],
  providers: [ErrorHandlingMonitoringService],
  controllers: [ErrorHandlingMonitoringController],
  exports: [ErrorHandlingMonitoringService],
})
export class ErrorHandlingMonitoringModule {}
