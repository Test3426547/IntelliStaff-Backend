import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@ApiTags('communication')
@Controller('communication')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CommunicationController {
  constructor(
    private readonly communicationService: CommunicationService,
    private health: HealthCheckService
  ) {}

  @Post('email')
  @ApiOperation({ summary: 'Send an email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  async sendEmail(@Body() emailData: { to: string; subject: string; body: string }) {
    await this.communicationService.sendEmail(emailData.to, emailData.subject, emailData.body);
    return { message: 'Email sent successfully' };
  }

  @Post('sms')
  @ApiOperation({ summary: 'Send an SMS' })
  @ApiResponse({ status: 200, description: 'SMS sent successfully' })
  async sendSMS(@Body() smsData: { to: string; body: string }) {
    await this.communicationService.sendSMS(smsData.to, smsData.body);
    return { message: 'SMS sent successfully' };
  }

  @Post('push-notification')
  @ApiOperation({ summary: 'Send a push notification' })
  @ApiResponse({ status: 200, description: 'Push notification sent successfully' })
  async sendPushNotification(@Body() notificationData: { userId: string; title: string; body: string }) {
    await this.communicationService.sendPushNotification(notificationData.userId, notificationData.title, notificationData.body);
    return { message: 'Push notification sent successfully' };
  }

  @Post('log')
  @ApiOperation({ summary: 'Log a communication' })
  @ApiResponse({ status: 200, description: 'Communication logged successfully' })
  async logCommunication(@Body() logData: { userId: string; type: string; details: any }) {
    await this.communicationService.logCommunication(logData.userId, logData.type, logData.details);
    return { message: 'Communication logged successfully' };
  }

  @HealthCheck()
  @ApiOperation({ summary: 'Check the health of the Communication service' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async checkHealth() {
    return this.health.check([
      () => this.communicationService.checkHealth(),
    ]);
  }
}
