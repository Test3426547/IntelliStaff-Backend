
import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../config/configuration.module';
import { CommonModule } from '../common/common.module';
import { DatabaseModule } from '../database/database.module';
import { UserManagementModule } from '../user-management/user-management.module';
import { SecurityModule } from '../security/security.module';
import { AuditLoggingModule } from '../audit-logging/audit-logging.module';
import { ErrorHandlingMonitoringModule } from '../error-handling-monitoring/error-handling-monitoring.module';

@Module({
  imports: [
    ConfigurationModule,
    CommonModule,
    DatabaseModule,
    UserManagementModule,
    SecurityModule,
    AuditLoggingModule,
    ErrorHandlingMonitoringModule,
  ],
  exports: [
    ConfigurationModule,
    CommonModule,
    DatabaseModule,
    UserManagementModule,
    SecurityModule,
    AuditLoggingModule,
    ErrorHandlingMonitoringModule,
  ],
})
export class CoreModule {}
