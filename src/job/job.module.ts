
import { Module } from '@nestjs/common';
import { JobIngestionModule } from '../job-ingestion/job-ingestion.module';
import { JobProcessingModule } from '../job-processing/job-processing.module';
import { JobRelistingModule } from '../job-relisting/job-relisting.module';

@Module({
  imports: [
    JobIngestionModule,
    JobProcessingModule,
    JobRelistingModule,
  ],
  exports: [
    JobIngestionModule,
    JobProcessingModule,
    JobRelistingModule,
  ],
})
export class JobModule {}
