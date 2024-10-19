import { Module } from '@nestjs/common';
import { ErrorHandlingMonitoringService } from './error-handling-monitoring.service';
import { ErrorHandlingMonitoringController } from './error-handling-monitoring.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [ErrorHandlingMonitoringService],
  controllers: [ErrorHandlingMonitoringController],
  exports: [ErrorHandlingMonitoringService],
})
export class ErrorHandlingMonitoringModule {}
