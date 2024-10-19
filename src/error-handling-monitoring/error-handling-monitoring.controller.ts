import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { ErrorHandlingMonitoringService } from './error-handling-monitoring.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../user-management/auth.guard';

@ApiTags('error-handling-monitoring')
@Controller('error-handling-monitoring')
@UseGuards(AuthGuard)
export class ErrorHandlingMonitoringController {
  constructor(private readonly errorHandlingMonitoringService: ErrorHandlingMonitoringService) {}

  @Post('log')
  @ApiOperation({ summary: 'Log an error' })
  @ApiResponse({ status: 201, description: 'Error logged successfully' })
  async logError(
    @Body('error') error: Error,
    @Body('context') context: string,
  ) {
    await this.errorHandlingMonitoringService.logError(error, context);
    return { message: 'Error logged successfully' };
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get error logs' })
  @ApiResponse({ status: 200, description: 'Returns error logs' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getErrorLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.errorHandlingMonitoringService.getErrorLogs(page, limit);
  }

  @Get('analyze')
  @ApiOperation({ summary: 'Analyze error logs' })
  @ApiResponse({ status: 200, description: 'Returns analysis of error logs' })
  @ApiQuery({ name: 'timeRange', required: true, type: String, description: 'Time range for analysis (e.g., "1 day", "1 week")' })
  async analyzeErrors(@Query('timeRange') timeRange: string) {
    const analysis = await this.errorHandlingMonitoringService.analyzeErrors(timeRange);
    return { analysis };
  }

  @Get('anomalies')
  @ApiOperation({ summary: 'Detect anomalies in error logs' })
  @ApiResponse({ status: 200, description: 'Returns detected anomalies in error logs' })
  @ApiQuery({ name: 'timeRange', required: true, type: String, description: 'Time range for anomaly detection (e.g., "1 day", "1 week")' })
  async detectAnomalies(@Query('timeRange') timeRange: string) {
    const anomalies = await this.errorHandlingMonitoringService.detectAnomalies(timeRange);
    return { anomalies };
  }
}
