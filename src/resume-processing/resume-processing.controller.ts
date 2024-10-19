import { Controller, Post, Get, Param, HttpException, HttpStatus, Query } from '@nestjs/common';
import { ResumeProcessingService } from './resume-processing.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('resume-processing')
@Controller('resume-processing')
export class ResumeProcessingController {
  constructor(private readonly resumeProcessingService: ResumeProcessingService) {}

  @Post('process/:id')
  @ApiOperation({ summary: 'Process a resume' })
  @ApiResponse({ status: 200, description: 'Resume processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ name: 'id', type: 'string', description: 'Resume ID' })
  async processResume(@Param('id') id: string) {
    try {
      return await this.resumeProcessingService.processResume(id);
    } catch (error) {
      if (error.message.includes('Failed to fetch resume')) {
        throw new HttpException('Resume not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to process resume', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all processed resumes' })
  @ApiResponse({ status: 200, description: 'Return all processed resumes' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getProcessedResumes(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    try {
      const resumes = await this.resumeProcessingService.getProcessedResumes();
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedResumes = resumes.slice(startIndex, endIndex);
      return {
        data: paginatedResumes,
        total: resumes.length,
        page,
        limit,
        totalPages: Math.ceil(resumes.length / limit)
      };
    } catch (error) {
      throw new HttpException('Failed to fetch processed resumes', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/feedback')
  @ApiOperation({ summary: 'Get personalized feedback for a resume' })
  @ApiResponse({ status: 200, description: 'Return personalized feedback' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ name: 'id', type: 'string', description: 'Resume ID' })
  async getPersonalizedFeedback(@Param('id') id: string) {
    try {
      const processedResume = await this.resumeProcessingService.processResume(id);
      return { feedback: processedResume.personalized_feedback };
    } catch (error) {
      if (error.message.includes('Failed to fetch resume')) {
        throw new HttpException('Resume not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to generate personalized feedback', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/scores')
  @ApiOperation({ summary: 'Get all scores for a processed resume' })
  @ApiResponse({ status: 200, description: 'Return all scores' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ name: 'id', type: 'string', description: 'Resume ID' })
  async getResumeScores(@Param('id') id: string) {
    try {
      const processedResume = await this.resumeProcessingService.processResume(id);
      return {
        keywordScore: processedResume.keyword_score,
        mlScore: processedResume.ml_score,
        nlpScore: processedResume.nlp_score,
        sentimentScore: processedResume.sentiment_score
      };
    } catch (error) {
      if (error.message.includes('Failed to fetch resume')) {
        throw new HttpException('Resume not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to retrieve resume scores', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
