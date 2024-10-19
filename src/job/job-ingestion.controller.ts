import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JobIngestionService } from './job-ingestion.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('job-ingestion')
@Controller('job-ingestion')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class JobIngestionController {
  constructor(private readonly jobIngestionService: JobIngestionService) {}

  @Post('linkedin-jobs')
  @ApiOperation({ summary: 'Scrape and ingest LinkedIn jobs' })
  @ApiResponse({ status: 201, description: 'Jobs scraped and ingested successfully' })
  async scrapeAndIngestLinkedInJobs(@Body() data: { searchUrl: string; limit?: number }) {
    const jobs = await this.jobIngestionService.scrapeAndIngestLinkedInJobs(data.searchUrl, data.limit);
    return { message: `${jobs.length} jobs scraped and ingested successfully`, jobs };
  }

  // ... (keep other existing methods)
}
