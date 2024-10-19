import { Controller, Post, UploadedFile, UseInterceptors, Body, Get, Query, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeIngestionService } from './resume-ingestion.service';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('resume-ingestion')
@Controller('resume-ingestion')
@UseGuards(ThrottlerGuard)
export class ResumeIngestionController {
  constructor(private readonly resumeIngestionService: ResumeIngestionService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload and process a resume file' })
  @ApiResponse({ status: 201, description: 'Resume uploaded and processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        email: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadResume(@UploadedFile() file: Express.Multer.File, @Body('email') email: string) {
    const path = await this.resumeIngestionService.uploadResume(file);
    await this.resumeIngestionService.sendConfirmationEmail(email, path);
    return { message: 'Resume uploaded and processed successfully', path };
  }

  @Post('ingest-email')
  @ApiOperation({ summary: 'Ingest resume from email' })
  @ApiResponse({ status: 201, description: 'Resume ingested successfully from email' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @HttpCode(HttpStatus.CREATED)
  async ingestResumeFromEmail(@Body('email') email: string) {
    const path = await this.resumeIngestionService.ingestResumeFromEmail(email);
    await this.resumeIngestionService.sendConfirmationEmail(email, path);
    return { message: 'Resume ingested successfully from email', path };
  }

  @Get()
  @ApiOperation({ summary: 'Get all processed resumes' })
  @ApiResponse({ status: 200, description: 'Return all processed resumes' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async getResumes(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10
  ): Promise<{ resumes: any[], totalCount: number }> {
    return this.resumeIngestionService.getResumes(page, pageSize);
  }
}
