import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserManagementModule } from './user-management/user-management.module';
import { JobModule } from './job/job.module';
import { ResumeModule } from './resume/resume.module';
import { ApplicantMatchingModule } from './applicant-matching/applicant-matching.module';
import { CommunicationModule } from './communication/communication.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { InvoicingBillingModule } from './invoicing-billing/invoicing-billing.module';
import { MlModelManagementModule } from './ml-model-management/ml-model-management.module';
import { NotificationModule } from './notification/notification.module';
import { AuditLoggingModule } from './audit-logging/audit-logging.module';
import { ErrorHandlingMonitoringModule } from './error-handling-monitoring/error-handling-monitoring.module';
import { SecurityModule } from './security/security.module';
import { DataStorageModule } from './data-storage/data-storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserManagementModule,
    JobModule,
    ResumeModule,
    ApplicantMatchingModule,
    CommunicationModule,
    AnalyticsModule,
    InvoicingBillingModule,
    MlModelManagementModule,
    NotificationModule,
    AuditLoggingModule,
    ErrorHandlingMonitoringModule,
    SecurityModule,
    DataStorageModule,
  ],
})
export class AppModule {}
