import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@ApiTags('resumes')
@Controller('resumes')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private health: HealthCheckService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new resume' })
  @ApiResponse({ status: 201, description: 'Resume created successfully' })
  async createResume(@Body() resumeData: any) {
    return this.resumeService.createResume(resumeData);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a resume by ID' })
  @ApiResponse({ status: 200, description: 'Resume retrieved successfully' })
  async getResume(@Param('id') id: string) {
    return this.resumeService.getResume(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a resume' })
  @ApiResponse({ status: 200, description: 'Resume updated successfully' })
  async updateResume(@Param('id') id: string, @Body() resumeData: any) {
    return this.resumeService.updateResume(id, resumeData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a resume' })
  @ApiResponse({ status: 200, description: 'Resume deleted successfully' })
  async deleteResume(@Param('id') id: string) {
    await this.resumeService.deleteResume(id);
    return { message: 'Resume deleted successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'List resumes' })
  @ApiResponse({ status: 200, description: 'Resumes listed successfully' })
  async listResumes(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.resumeService.listResumes(page, limit);
  }

  @Get('health')
  @HealthCheck()
  @ApiOperation({ summary: 'Check the health of the Resume service' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async checkHealth() {
    return this.health.check([
      () => this.resumeService.checkHealth(),
    ]);
  }
}
