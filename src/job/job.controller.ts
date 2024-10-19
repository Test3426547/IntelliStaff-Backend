import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JobService } from './job.service';
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
    private health: HealthCheckService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  async createJob(@Body() jobData: any) {
    return this.jobService.createJob(jobData);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job by ID' })
  @ApiResponse({ status: 200, description: 'Job retrieved successfully' })
  async getJob(@Param('id') id: string) {
    return this.jobService.getJob(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a job' })
  @ApiResponse({ status: 200, description: 'Job updated successfully' })
  async updateJob(@Param('id') id: string, @Body() jobData: any) {
    return this.jobService.updateJob(id, jobData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a job' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  async deleteJob(@Param('id') id: string) {
    await this.jobService.deleteJob(id);
    return { message: 'Job deleted successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'List jobs' })
  @ApiResponse({ status: 200, description: 'Jobs listed successfully' })
  async listJobs(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.jobService.listJobs(page, limit);
  }

  @Get('health')
  @HealthCheck()
  @ApiOperation({ summary: 'Check the health of the Job service' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async checkHealth() {
    return this.health.check([
      () => this.jobService.checkHealth(),
    ]);
  }
}
