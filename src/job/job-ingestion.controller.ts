import { Controller, Post, Get, Body, Query, UseGuards, Logger } from '@nestjs/common';
import { JobIngestionService } from './job-ingestion.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('job-ingestion')
@Controller('job-ingestion')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class JobIngestionController {
  private readonly logger = new Logger(JobIngestionController.name);

  constructor(private readonly jobIngestionService: JobIngestionService) {}

  @Post('linkedin-jobs')
  @ApiOperation({ summary: 'Scrape and ingest LinkedIn jobs' })
  @ApiResponse({ status: 201, description: 'Jobs scraped and ingested successfully' })
  async scrapeAndIngestLinkedInJobs(@Body() data: { searchUrl: string; limit?: number }) {
    this.logger.log(`Received request to scrape LinkedIn jobs. URL: ${data.searchUrl}, Limit: ${data.limit || 'default'}`);
    try {
      const startTime = Date.now();
      const jobs = await this.jobIngestionService.scrapeAndIngestLinkedInJobs(data.searchUrl, data.limit);
      const endTime = Date.now();
      const duration = endTime - startTime;
      this.logger.log(`Successfully scraped and ingested ${jobs.length} LinkedIn jobs in ${duration}ms`);
      return { 
        message: `${jobs.length} jobs scraped and ingested successfully`,
        jobs,
        statistics: {
          totalJobs: jobs.length,
          duration: duration,
          averageTimePerJob: jobs.length > 0 ? duration / jobs.length : 0
        }
      };
    } catch (error) {
      this.logger.error(`Error in scrapeAndIngestLinkedInJobs: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('job')
  @ApiOperation({ summary: 'Get a job by ID' })
  @ApiResponse({ status: 200, description: 'Job retrieved successfully' })
  async getJob(@Query('id') id: string) {
    this.logger.log(`Received request to get job with ID: ${id}`);
    try {
      const job = await this.jobIngestionService.getJobById(id);
      if (job) {
        this.logger.log(`Successfully retrieved job with ID: ${id}`);
        return job;
      } else {
        this.logger.warn(`Job with ID ${id} not found`);
        return { message: 'Job not found' };
      }
    } catch (error) {
      this.logger.error(`Error in getJob: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List jobs' })
  @ApiResponse({ status: 200, description: 'Jobs listed successfully' })
  async listJobs(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    this.logger.log(`Received request to list jobs. Page: ${page}, Limit: ${limit}`);
    try {
      const startTime = Date.now();
      const { jobs, total } = await this.jobIngestionService.listJobs(page, limit);
      const endTime = Date.now();
      const duration = endTime - startTime;
      this.logger.log(`Successfully listed ${jobs.length} jobs. Total: ${total}. Query time: ${duration}ms`);
      return { 
        jobs, 
        total, 
        page, 
        limit,
        queryTime: duration
      };
    } catch (error) {
      this.logger.error(`Error in listJobs: ${error.message}`, error.stack);
      throw error;
    }
  }
}
