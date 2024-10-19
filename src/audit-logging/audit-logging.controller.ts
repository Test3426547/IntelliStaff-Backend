import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuditLoggingService } from './audit-logging.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@ApiTags('audit-logging')
@Controller('audit-logging')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AuditLoggingController {
  constructor(
    private readonly auditLoggingService: AuditLoggingService,
    private health: HealthCheckService
  ) {}

  @Post('log-activity')
  @ApiOperation({ summary: 'Log an activity' })
  @ApiResponse({ status: 201, description: 'Activity logged successfully' })
  async logActivity(@Body() activityData: { userId: string; action: string; details: any }) {
    await this.auditLoggingService.logActivity(activityData.userId, activityData.action, activityData.details);
    return { message: 'Activity logged successfully' };
  }

  @Get('audit-trail')
  @ApiOperation({ summary: 'Generate audit trail' })
  @ApiResponse({ status: 200, description: 'Audit trail generated successfully' })
  async generateAuditTrail(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.auditLoggingService.generateAuditTrail(start, end);
  }

  @Post('create-alert')
  @ApiOperation({ summary: 'Create an alert' })
  @ApiResponse({ status: 201, description: 'Alert created successfully' })
  async createAlert(@Body() alertData: { type: string; message: string; severity: 'low' | 'medium' | 'high' }) {
    await this.auditLoggingService.createAlert(alertData.type, alertData.message, alertData.severity);
    return { message: 'Alert created successfully' };
  }

  @Get('health')
  @HealthCheck()
  @ApiOperation({ summary: 'Check the health of the Audit and Logging service' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async checkHealth() {
    return this.health.check([
      () => this.auditLoggingService.checkHealth(),
    ]);
  }
}
