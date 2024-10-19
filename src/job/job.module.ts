import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { JobIngestionService } from './job-ingestion.service';
import { JobProcessingService } from './job-processing.service';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [ConfigModule, TerminusModule],
  providers: [JobService, JobIngestionService, JobProcessingService],
  controllers: [JobController],
  exports: [JobService, JobIngestionService, JobProcessingService],
})
export class JobModule {}
