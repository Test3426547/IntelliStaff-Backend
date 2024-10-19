import { Module } from '@nestjs/common';
import { JobIngestionService } from './job-ingestion.service';
import { JobIngestionController } from './job-ingestion.controller';
import { WebScraperService } from './web-scraper.service';
import { JobProcessingModule } from '../job-processing/job-processing.module';

@Module({
  imports: [JobProcessingModule],
  providers: [JobIngestionService, WebScraperService],
  controllers: [JobIngestionController],
  exports: [JobIngestionService],
})
export class JobIngestionModule {}
