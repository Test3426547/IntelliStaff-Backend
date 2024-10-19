import { Controller, Get, Post } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('setup-database')
  @ApiOperation({ summary: 'Set up the database with sample data' })
  @ApiResponse({ status: 200, description: 'Database set up successfully' })
  async setupDatabase() {
    await this.analyticsService.setupDatabase();
    return { message: 'Database set up successfully' };
  }

  @Get('job-stats')
  @ApiOperation({ summary: 'Get job posting statistics' })
  @ApiResponse({ status: 200, description: 'Returns job posting statistics' })
  async getJobPostingStats() {
    return this.analyticsService.getJobPostingStats();
  }

  @Get('applicant-stats')
  @ApiOperation({ summary: 'Get applicant statistics' })
  @ApiResponse({ status: 200, description: 'Returns applicant statistics' })
  async getApplicantStats() {
    return this.analyticsService.getApplicantStats();
  }

  @Get('matching-insights')
  @ApiOperation({ summary: 'Get matching insights' })
  @ApiResponse({ status: 200, description: 'Returns insights on job-applicant matching' })
  async getMatchingInsights() {
    return this.analyticsService.getMatchingInsights();
  }
}