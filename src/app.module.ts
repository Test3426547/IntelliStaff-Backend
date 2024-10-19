import { Module } from '@nestjs/common';
import { ConfigurationModule } from './config/configuration.module';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { JobIngestionModule } from './job-ingestion/job-ingestion.module';
import { JobProcessingModule } from './job-processing/job-processing.module';
import { JobRelistingModule } from './job-relisting/job-relisting.module';
import { ResumeIngestionModule } from './resume-ingestion/resume-ingestion.module';
import { ResumeProcessingModule } from './resume-processing/resume-processing.module';
import { ApplicantMatchingModule } from './applicant-matching/applicant-matching.module';
import { CommunicationModule } from './communication/communication.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UserManagementModule } from './user-management/user-management.module';
import { MlModelManagementModule } from './ml-model-management/ml-model-management.module';
import { InvoicingBillingModule } from './invoicing-billing/invoicing-billing.module';
import { NotificationModule } from './notification/notification.module';
import { AuditLoggingModule } from './audit-logging/audit-logging.module';
import { ErrorHandlingMonitoringModule } from './error-handling-monitoring/error-handling-monitoring.module';
import { IntegrationModule } from './integration/integration.module';
import { SecurityModule } from './security/security.module';
import { DataStorageModule } from './data-storage/data-storage.module';
import { ApiGatewayModule } from './api-gateway/api-gateway.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventEmitterService } from './common/events/event.emitter';

@Module({
  imports: [
    ConfigurationModule,
    CommonModule,
    DatabaseModule,
    JobIngestionModule,
    JobProcessingModule,
    JobRelistingModule,
    ResumeIngestionModule,
    ResumeProcessingModule,
    ApplicantMatchingModule,
    CommunicationModule,
    AnalyticsModule,
    UserManagementModule,
    MlModelManagementModule,
    InvoicingBillingModule,
    NotificationModule,
    AuditLoggingModule,
    ErrorHandlingMonitoringModule,
    IntegrationModule,
    SecurityModule,
    DataStorageModule,
    ApiGatewayModule,
    EventEmitterModule.forRoot(),
  ],
  providers: [EventEmitterService],
})
export class AppModule {}
