
import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { JobModule } from './job/job.module';
import { ResumeModule } from './resume/resume.module';
import { ApplicantMatchingModule } from './applicant-matching/applicant-matching.module';
import { CommunicationModule } from './communication/communication.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MlModelManagementModule } from './ml-model-management/ml-model-management.module';
import { InvoicingBillingModule } from './invoicing-billing/invoicing-billing.module';
import { NotificationModule } from './notification/notification.module';
import { IntegrationModule } from './integration/integration.module';
import { DataStorageModule } from './data-storage/data-storage.module';
import { ApiGatewayModule } from './api-gateway/api-gateway.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    CoreModule,
    JobModule,
    ResumeModule,
    ApplicantMatchingModule,
    CommunicationModule,
    AnalyticsModule,
    MlModelManagementModule,
    InvoicingBillingModule,
    NotificationModule,
    IntegrationModule,
    DataStorageModule,
    ApiGatewayModule,
    EventEmitterModule.forRoot(),
  ],
})
export class AppModule {}
