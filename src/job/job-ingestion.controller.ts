import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
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

  @Get('job')
  @ApiOperation({ summary: 'Get a job by ID' })
  @ApiResponse({ status: 200, description: 'Job retrieved successfully' })
  async getJob(@Query('id') id: string) {
    const job = await this.jobIngestionService.getJobById(id);
    return job ? job : { message: 'Job not found' };
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List jobs' })
  @ApiResponse({ status: 200, description: 'Jobs listed successfully' })
  async listJobs(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    const { jobs, total } = await this.jobIngestionService.listJobs(page, limit);
    return { jobs, total, page, limit };
  }
}
