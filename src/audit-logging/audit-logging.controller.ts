import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLoggingService } from './audit-logging.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../user-management/auth.guard';

@ApiTags('audit-logging')
@Controller('audit-logging')
@UseGuards(AuthGuard)
export class AuditLoggingController {
  constructor(private readonly auditLoggingService: AuditLoggingService) {}

  @Post('log')
  @ApiOperation({ summary: 'Log an action' })
  @ApiResponse({ status: 201, description: 'Action logged successfully' })
  async logAction(
    @Body('userId') userId: string,
    @Body('action') action: string,
    @Body('details') details: any,
  ) {
    await this.auditLoggingService.logAction(userId, action, details);
    return { message: 'Action logged successfully' };
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiResponse({ status: 200, description: 'Returns audit logs' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAuditLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.auditLoggingService.getAuditLogs(page, limit);
  }

  @Get('analyze')
  @ApiOperation({ summary: 'Analyze audit logs' })
  @ApiResponse({ status: 200, description: 'Returns analysis of audit logs' })
  @ApiQuery({ name: 'timeRange', required: true, type: String, description: 'Time range for analysis (e.g., "1 day", "1 week")' })
  async analyzeAuditLogs(@Query('timeRange') timeRange: string) {
    const analysis = await this.auditLoggingService.analyzeAuditLogs(timeRange);
    return { analysis };
  }

  @Get('anomalies')
  @ApiOperation({ summary: 'Detect anomalies in audit logs' })
  @ApiResponse({ status: 200, description: 'Returns detected anomalies in audit logs' })
  @ApiQuery({ name: 'timeRange', required: true, type: String, description: 'Time range for anomaly detection (e.g., "1 day", "1 week")' })
  async detectAnomalies(@Query('timeRange') timeRange: string) {
    const anomalies = await this.auditLoggingService.detectAnomalies(timeRange);
    return { anomalies };
  }
}
