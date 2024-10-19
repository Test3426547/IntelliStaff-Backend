import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { JobProcessingService } from './job-processing.service';
import { JobIngestionService } from './job-ingestion.service';
import { JobIngestionController } from './job-ingestion.controller';

@Module({
  imports: [ConfigModule],
  providers: [JobService, JobProcessingService, JobIngestionService],
  controllers: [JobController, JobIngestionController],
  exports: [JobService, JobProcessingService, JobIngestionService],
})
export class JobModule {}
