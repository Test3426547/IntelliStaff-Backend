import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ErrorHandlingMonitoringService } from './error-handling-monitoring.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@ApiTags('error-handling-monitoring')
@Controller('error-handling-monitoring')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ErrorHandlingMonitoringController {
  constructor(
    private readonly errorHandlingMonitoringService: ErrorHandlingMonitoringService,
    private health: HealthCheckService
  ) {}

  @Post('log-error')
  @ApiOperation({ summary: 'Log an error' })
  @ApiResponse({ status: 201, description: 'Error logged successfully' })
  async logError(@Body() errorData: { message: string; stack?: string; context?: any }) {
    const error = new Error(errorData.message);
    if (errorData.stack) {
      error.stack = errorData.stack;
    }
    this.errorHandlingMonitoringService.captureException(error, errorData.context);
    return { message: 'Error logged successfully' };
  }

  @Post('log-message')
  @ApiOperation({ summary: 'Log a message' })
  @ApiResponse({ status: 201, description: 'Message logged successfully' })
  async logMessage(@Body() messageData: { message: string; level: string; context?: any }) {
    this.errorHandlingMonitoringService.captureMessage(messageData.message, messageData.level as any, messageData.context);
    return { message: 'Message logged successfully' };
  }

  @Get('error-logs')
  @ApiOperation({ summary: 'Get error logs' })
  @ApiResponse({ status: 200, description: 'Error logs retrieved successfully' })
  async getErrorLogs(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.errorHandlingMonitoringService.getErrorLogs(page, limit);
  }

  @Get('performance-metrics')
  @ApiOperation({ summary: 'Get performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved successfully' })
  async getPerformanceMetrics(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.errorHandlingMonitoringService.getPerformanceMetrics(new Date(startDate), new Date(endDate));
  }

  @Post('record-metric')
  @ApiOperation({ summary: 'Record a performance metric' })
  @ApiResponse({ status: 201, description: 'Performance metric recorded successfully' })
  async recordPerformanceMetric(@Body() metricData: { name: string; value: number }) {
    await this.errorHandlingMonitoringService.recordPerformanceMetric(metricData.name, metricData.value);
    return { message: 'Performance metric recorded successfully' };
  }

  @Get('health')
  @HealthCheck()
  @ApiOperation({ summary: 'Check the health of the Error Handling and Monitoring service' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async checkHealth() {
    return this.health.check([
      () => this.errorHandlingMonitoringService.checkHealth(),
    ]);
  }
}
