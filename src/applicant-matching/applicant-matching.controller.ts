import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApplicantMatchingService } from './applicant-matching.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@ApiTags('applicant-matching')
@Controller('applicant-matching')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ApplicantMatchingController {
  constructor(
    private readonly applicantMatchingService: ApplicantMatchingService,
    private health: HealthCheckService
  ) {}

  @Post('match')
  @ApiOperation({ summary: 'Match an applicant to a job' })
  @ApiResponse({ status: 201, description: 'Match created successfully' })
  async matchApplicantToJob(@Body('applicantId') applicantId: string, @Body('jobId') jobId: string) {
    return this.applicantMatchingService.matchApplicantToJob(applicantId, jobId);
  }

  @Get('applicant/:id')
  @ApiOperation({ summary: 'Get matches for an applicant' })
  @ApiResponse({ status: 200, description: 'Matches retrieved successfully' })
  async getMatchesForApplicant(@Param('id') applicantId: string) {
    return this.applicantMatchingService.getMatchesForApplicant(applicantId);
  }

  @Get('job/:id')
  @ApiOperation({ summary: 'Get matches for a job' })
  @ApiResponse({ status: 200, description: 'Matches retrieved successfully' })
  async getMatchesForJob(@Param('id') jobId: string) {
    return this.applicantMatchingService.getMatchesForJob(jobId);
  }

  @Delete('match/:id')
  @ApiOperation({ summary: 'Remove a match' })
  @ApiResponse({ status: 200, description: 'Match removed successfully' })
  async removeMatch(@Param('id') matchId: string) {
    await this.applicantMatchingService.removeMatch(matchId);
    return { message: 'Match removed successfully' };
  }

  @Get('match/:id/report')
  @ApiOperation({ summary: 'Generate a detailed match report' })
  @ApiResponse({ status: 200, description: 'Match report generated successfully' })
  async generateMatchReport(@Param('id') matchId: string) {
    return this.applicantMatchingService.generateMatchReport(matchId);
  }

  @Get('health')
  @HealthCheck()
  @ApiOperation({ summary: 'Check the health of the ApplicantMatching service' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async checkHealth() {
    return this.health.check([
      () => this.applicantMatchingService.checkHealth(),
    ]);
  }
}
