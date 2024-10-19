import { Controller, Get, Post, UseInterceptors, UploadedFile, Body, Query, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeIngestionService } from './resume-ingestion.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@ApiTags('resume-ingestion')
@Controller('resume-ingestion')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ResumeIngestionController {
  constructor(
    private readonly resumeIngestionService: ResumeIngestionService,
    private health: HealthCheckService
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a resume' })
  @ApiResponse({ status: 201, description: 'Resume uploaded successfully' })
  async uploadResume(@UploadedFile() file: Express.Multer.File) {
    return this.resumeIngestionService.uploadResume(file);
  }

  @Post('ingest-email')
  @ApiOperation({ summary: 'Ingest resume from email' })
  @ApiResponse({ status: 201, description: 'Resume ingested from email successfully' })
  async ingestResumeFromEmail(@Body('email') email: string) {
    return this.resumeIngestionService.ingestResumeFromEmail(email);
  }

  @Get()
  @ApiOperation({ summary: 'Get resumes' })
  @ApiResponse({ status: 200, description: 'Resumes retrieved successfully' })
  async getResumes(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.resumeIngestionService.getResumes(page, limit);
  }

  @Get('health')
  @HealthCheck()
  @ApiOperation({ summary: 'Check the health of the Resume Ingestion service' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async checkHealth() {
    return this.health.check([
      () => this.resumeIngestionService.checkHealth(),
    ]);
  }
}
