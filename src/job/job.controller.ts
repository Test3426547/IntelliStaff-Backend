import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JobService } from './job.service';
import { JobIngestionService } from './job-ingestion.service';
import { JobProcessingService } from './job-processing.service';
import { JobRelistingService } from './job-relisting.service';
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
    private readonly jobProcessingService: JobProcessingService,
    private readonly jobRelistingService: JobRelistingService,
    private health: HealthCheckService
  ) {}

  // ... (keep existing endpoints)

  @Post('relist/:id')
  @ApiOperation({ summary: 'Relist a job' })
  @ApiResponse({ status: 200, description: 'Job relisted successfully' })
  async relistJob(@Param('id') id: string) {
    return this.jobRelistingService.relistJob(id);
  }

  @Get('relist/status/:id')
  @ApiOperation({ summary: 'Get job relisting status' })
  @ApiResponse({ status: 200, description: 'Job relisting status retrieved successfully' })
  async getJobRelistingStatus(@Param('id') id: string) {
    return this.jobRelistingService.getJobRelistingStatus(id);
  }

  // ... (keep existing health check endpoint)
}
