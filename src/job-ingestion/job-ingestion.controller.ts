import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { JobIngestionService } from './job-ingestion.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Job } from '../common/interfaces/job.interface';

@ApiTags('job-ingestion')
@Controller('job-ingestion')
export class JobIngestionController {
  constructor(private readonly jobIngestionService: JobIngestionService) {}

  @Post('ingest')
  @ApiOperation({ summary: 'Ingest jobs from a given URL' })
  @ApiResponse({ status: 201, description: 'Jobs ingested successfully' })
  @ApiQuery({ name: 'url', required: true, type: String })
  @ApiQuery({ name: 'batchSize', required: false, type: Number, description: 'Number of jobs to process in each batch' })
  @ApiQuery({ name: 'maxJobs', required: false, type: Number, description: 'Maximum number of jobs to scrape' })
  async ingestJobs(
    @Query('url') url: string,
    @Query('batchSize') batchSize: number = 10,
    @Query('maxJobs') maxJobs: number = 100
  ) {
    await this.jobIngestionService.ingestJobs(url, batchSize, maxJobs);
    return { message: 'Jobs ingested successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all ingested jobs' })
  @ApiResponse({ status: 200, description: 'Return all jobs', type: [Job] })
  async getJobs(): Promise<Job[]> {
    return this.jobIngestionService.getJobs();
  }
}
