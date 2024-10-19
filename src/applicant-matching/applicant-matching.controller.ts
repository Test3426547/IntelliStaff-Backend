import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApplicantMatchingService } from './applicant-matching.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('applicant-matching')
@Controller('applicant-matching')
export class ApplicantMatchingController {
  constructor(private readonly applicantMatchingService: ApplicantMatchingService) {}

  @Post('match')
  @ApiOperation({ summary: 'Match an applicant with a job' })
  @ApiResponse({ status: 200, description: 'Returns the match score' })
  async matchApplicant(
    @Body('applicantId') applicantId: string,
    @Body('jobId') jobId: string,
  ) {
    const matchScore = await this.applicantMatchingService.matchApplicant(applicantId, jobId);
    return { matchScore };
  }

  @Get('job/:jobId/top-matches')
  @ApiOperation({ summary: 'Get top matches for a job' })
  @ApiResponse({ status: 200, description: 'Returns the top matches for a job' })
  @ApiParam({ name: 'jobId', type: 'string' })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  async getTopMatchesForJob(
    @Param('jobId') jobId: string,
    @Query('limit') limit: number,
  ) {
    return this.applicantMatchingService.getTopMatchesForJob(jobId, limit);
  }

  @Get('applicant/:applicantId/top-matches')
  @ApiOperation({ summary: 'Get top matches for an applicant' })
  @ApiResponse({ status: 200, description: 'Returns the top matches for an applicant' })
  @ApiParam({ name: 'applicantId', type: 'string' })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  async getTopMatchesForApplicant(
    @Param('applicantId') applicantId: string,
    @Query('limit') limit: number,
  ) {
    return this.applicantMatchingService.getTopMatchesForApplicant(applicantId, limit);
  }

  @Post('enhance-matching')
  @ApiOperation({ summary: 'Enhance matching with HuggingFace AI' })
  @ApiResponse({ status: 200, description: 'Returns enhanced matching analysis' })
  async enhanceMatching(
    @Body('applicantId') applicantId: string,
    @Body('jobId') jobId: string,
  ) {
    const analysis = await this.applicantMatchingService.enhanceMatchingWithHuggingFace(applicantId, jobId);
    return { analysis };
  }
}
