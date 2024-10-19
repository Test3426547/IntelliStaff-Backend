import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ResumeProcessingService } from './resume-processing.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@ApiTags('resume-processing')
@Controller('resume-processing')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ResumeProcessingController {
  constructor(
    private readonly resumeProcessingService: ResumeProcessingService,
    private health: HealthCheckService
  ) {}

  @Post(':id/process')
  @ApiOperation({ summary: 'Process a resume' })
  @ApiResponse({ status: 200, description: 'Resume processed successfully' })
  async processResume(@Param('id') id: string) {
    return this.resumeProcessingService.processResume(id);
  }

  @Get(':id/feedback')
  @ApiOperation({ summary: 'Generate personalized feedback for a resume' })
  @ApiResponse({ status: 200, description: 'Personalized feedback generated successfully' })
  async getPersonalizedFeedback(@Param('id') id: string) {
    return this.resumeProcessingService.generatePersonalizedFeedback(id);
  }

  @Get('health')
  @HealthCheck()
  @ApiOperation({ summary: 'Check the health of the Resume Processing service' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async checkHealth() {
    return this.health.check([
      () => this.resumeProcessingService.checkHealth(),
    ]);
  }
}
