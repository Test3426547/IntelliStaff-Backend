import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { JobProcessingService } from './job-processing.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Job } from '../common/interfaces/job.interface';

@ApiTags('job-processing')
@Controller('job-processing')
export class JobProcessingController {
  constructor(private readonly jobProcessingService: JobProcessingService) {}

  @Post('optimize/:jobId')
  @ApiOperation({ summary: 'Optimize a job posting' })
  @ApiResponse({ status: 200, description: 'Job optimized successfully', type: Job })
  async optimizeJob(@Param('jobId') jobId: string): Promise<Job> {
    return this.jobProcessingService.optimizeJob(jobId);
  }

  @Get('optimized')
  @ApiOperation({ summary: 'Get all optimized jobs' })
  @ApiResponse({ status: 200, description: 'Return all optimized jobs', type: [Job] })
  async getOptimizedJobs(): Promise<Job[]> {
    return this.jobProcessingService.getOptimizedJobs();
  }

  @Post('process')
  @ApiOperation({ summary: 'Process multiple jobs' })
  @ApiResponse({ status: 200, description: 'Jobs processed successfully' })
  async processJobs(@Body('jobIds') jobIds: string[]): Promise<void> {
    await this.jobProcessingService.processJobs(jobIds);
    return;
  }
}
