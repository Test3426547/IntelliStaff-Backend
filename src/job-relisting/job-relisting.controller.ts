import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { JobRelistingService } from './job-relisting.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Job } from '../common/interfaces/job.interface';

@ApiTags('job-relisting')
@Controller('job-relisting')
export class JobRelistingController {
  constructor(private readonly jobRelistingService: JobRelistingService) {}

  @Post('relist')
  @ApiOperation({ summary: 'Relist a job on external platforms' })
  @ApiResponse({ status: 200, description: 'Job added to relisting queue successfully', type: Job })
  async relistJob(@Body('jobId') jobId: string): Promise<Job> {
    return this.jobRelistingService.relistJob(jobId);
  }

  @Get('relisted')
  @ApiOperation({ summary: 'Get all relisted jobs' })
  @ApiResponse({ status: 200, description: 'Return all relisted jobs', type: [Job] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async getRelistedJobs(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10
  ): Promise<{ jobs: Job[], totalCount: number }> {
    return this.jobRelistingService.getRelistedJobs(page, pageSize);
  }
}
