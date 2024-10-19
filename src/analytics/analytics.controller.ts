import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private health: HealthCheckService
  ) {}

  @Get('job-posting-stats')
  @ApiOperation({ summary: 'Get job posting statistics' })
  @ApiResponse({ status: 200, description: 'Job posting statistics retrieved successfully' })
  async getJobPostingStats(@Query('timeRange') timeRange: string = 'month') {
    return this.analyticsService.getJobPostingStats(timeRange);
  }

  @Get('applicant-stats')
  @ApiOperation({ summary: 'Get applicant statistics' })
  @ApiResponse({ status: 200, description: 'Applicant statistics retrieved successfully' })
  async getApplicantStats(@Query('timeRange') timeRange: string = 'month') {
    return this.analyticsService.getApplicantStats(timeRange);
  }

  @Get('matching-insights')
  @ApiOperation({ summary: 'Get matching insights' })
  @ApiResponse({ status: 200, description: 'Matching insights retrieved successfully' })
  async getMatchingInsights(@Query('timeRange') timeRange: string = 'month') {
    return this.analyticsService.getMatchingInsights(timeRange);
  }

  @Get('recruitment-funnel')
  @ApiOperation({ summary: 'Get recruitment funnel analysis' })
  @ApiResponse({ status: 200, description: 'Recruitment funnel analysis retrieved successfully' })
  async getRecruitmentFunnelAnalysis(@Query('timeRange') timeRange: string = 'month') {
    return this.analyticsService.getRecruitmentFunnelAnalysis(timeRange);
  }

  @Get('market-trends')
  @ApiOperation({ summary: 'Get market trends analysis' })
  @ApiResponse({ status: 200, description: 'Market trends analysis retrieved successfully' })
  async getMarketTrendsAnalysis() {
    return this.analyticsService.getMarketTrendsAnalysis();
  }

  @Get('health')
  @HealthCheck()
  @ApiOperation({ summary: 'Check the health of the Analytics service' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async checkHealth() {
    return this.health.check([
      () => this.analyticsService.checkHealth(),
    ]);
  }
}
