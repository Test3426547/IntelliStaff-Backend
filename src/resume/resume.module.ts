
import { Module } from '@nestjs/common';
import { ResumeIngestionModule } from '../resume-ingestion/resume-ingestion.module';
import { ResumeProcessingModule } from '../resume-processing/resume-processing.module';

@Module({
  imports: [
    ResumeIngestionModule,
    ResumeProcessingModule,
  ],
  exports: [
    ResumeIngestionModule,
    ResumeProcessingModule,
  ],
})
export class ResumeModule {}
