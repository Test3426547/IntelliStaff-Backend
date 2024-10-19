import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JobService } from './job.service';
import { JobIngestionService } from './job-ingestion.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@ApiTags('jobs')
@Controller('jobs')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly jobIngestionService: JobIngestionService,
    private health: HealthCheckService
  ) {}

  // ... (keep existing endpoints)

  @Post('ingest')
  @ApiOperation({ summary: 'Ingest a new job' })
  @ApiResponse({ status: 201, description: 'Job ingested successfully' })
  async ingestJob(@Body() jobData: any) {
    return this.jobIngestionService.ingestJob(jobData);
  }

  @Post('scrape')
  @ApiOperation({ summary: 'Scrape jobs from a website' })
  @ApiResponse({ status: 200, description: 'Jobs scraped successfully' })
  async scrapeJobs(@Body('url') url: string) {
    return this.jobIngestionService.scrapeJobsFromWebsite(url);
  }

  @Post('process-queue')
  @ApiOperation({ summary: 'Start processing the job queue' })
  @ApiResponse({ status: 200, description: 'Job queue processing started' })
  async processJobQueue() {
    await this.jobIngestionService.processJobQueue();
    return { message: 'Job queue processing started' };
  }

  // ... (keep existing health check endpoint)
}
