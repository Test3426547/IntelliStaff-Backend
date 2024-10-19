import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserManagementModule } from './user-management/user-management.module';
import { JobModule } from './job/job.module';
import { ResumeModule } from './resume/resume.module';
import { ApplicantMatchingModule } from './applicant-matching/applicant-matching.module';
import { CommunicationModule } from './communication/communication.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { InvoicingBillingModule } from './invoicing-billing/invoicing-billing.module';

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
  ],
})
export class AppModule {}
