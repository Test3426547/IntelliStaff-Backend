import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { JobIngestionService } from './job-ingestion.service';
import { JobProcessingService } from './job-processing.service';
import { JobRelistingService } from './job-relisting.service';
import { IntegrationModule } from '../integration/integration.module';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [ConfigModule, IntegrationModule, TerminusModule],
  providers: [JobService, JobIngestionService, JobProcessingService, JobRelistingService],
  controllers: [JobController],
  exports: [JobService, JobIngestionService, JobProcessingService, JobRelistingService],
})
export class JobModule {}
