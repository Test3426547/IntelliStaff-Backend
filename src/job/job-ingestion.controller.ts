import { Controller, Post, Get, Body, Query, UseGuards, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { JobIngestionService, JobData } from './job-ingestion.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('job-ingestion')
@Controller('job-ingestion')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class JobIngestionController {
  private readonly logger = new Logger(JobIngestionController.name);

  constructor(private readonly jobIngestionService: JobIngestionService) {}

  @Post('linkedin-job')
  @ApiOperation({ summary: 'Scrape and ingest a LinkedIn job' })
  @ApiResponse({ status: 201, description: 'Job scraped and ingested successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async scrapeAndIngestLinkedInJob(@Body() data: { jobId: string }): Promise<any> {
    this.logger.log(`Received request to scrape LinkedIn job. Job ID: ${data.jobId}`);
    try {
      if (!data.jobId) {
        throw new HttpException('Job ID is required', HttpStatus.BAD_REQUEST);
      }

      const startTime = Date.now();
      const job = await this.jobIngestionService.scrapeAndIngestLinkedInJobs(data.jobId);
      const endTime = Date.now();
      const duration = endTime - startTime;
      this.logger.log(`Successfully scraped and ingested LinkedIn job in ${duration}ms`);
      return { 
        message: 'Job scraped and ingested successfully',
        job,
        statistics: {
          duration: duration,
        }
      };
    } catch (error) {
      this.logger.error(`Error in scrapeAndIngestLinkedInJob: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to scrape and ingest LinkedIn job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('job')
  @ApiOperation({ summary: 'Get a job by ID' })
  @ApiResponse({ status: 200, description: 'Job retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getJob(@Query('id') id: string): Promise<JobData> {
    this.logger.log(`Received request to get job with ID: ${id}`);
    try {
      const job = await this.jobIngestionService.getJobById(id);
      if (job) {
        this.logger.log(`Successfully retrieved job with ID: ${id}`);
        return job;
      } else {
        this.logger.warn(`Job with ID ${id} not found`);
        throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      this.logger.error(`Error in getJob: ${error.message}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List jobs' })
  @ApiResponse({ status: 200, description: 'Jobs listed successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async listJobs(@Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<any> {
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
      this.logger.error(`Error in listJobs: ${error.message}`);
      throw new HttpException('Failed to list jobs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
