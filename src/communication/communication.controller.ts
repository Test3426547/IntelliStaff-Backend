import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Send an email using a template' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  async sendEmail(@Body() emailData: { to: string; subject: string; templateName: string; context: any }) {
    await this.communicationService.sendEmail(emailData.to, emailData.subject, emailData.templateName, emailData.context);
    return { message: 'Email sent successfully' };
  }

  @Post('sms')
  @ApiOperation({ summary: 'Send an SMS using a template' })
  @ApiResponse({ status: 200, description: 'SMS sent successfully' })
  async sendSMS(@Body() smsData: { to: string; templateName: string; context: any }) {
    await this.communicationService.sendSMS(smsData.to, smsData.templateName, smsData.context);
    return { message: 'SMS sent successfully' };
  }

  @Post('push-notification')
  @ApiOperation({ summary: 'Send a push notification using a template' })
  @ApiResponse({ status: 200, description: 'Push notification sent successfully' })
  async sendPushNotification(@Body() notificationData: { userId: string; templateName: string; context: any }) {
    await this.communicationService.sendPushNotification(notificationData.userId, notificationData.templateName, notificationData.context);
    return { message: 'Push notification sent successfully' };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get communication history for a recipient' })
  @ApiResponse({ status: 200, description: 'Communication history retrieved successfully' })
  async getCommunicationHistory(@Query('recipientId') recipientId: string, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.communicationService.getCommunicationHistory(recipientId, page, limit);
  }

  @Post('template')
  @ApiOperation({ summary: 'Add a new message template' })
  @ApiResponse({ status: 200, description: 'Message template added successfully' })
  async addMessageTemplate(@Body() templateData: { name: string; template: string }) {
    await this.communicationService.addMessageTemplate(templateData.name, templateData.template);
    return { message: 'Message template added successfully' };
  }

  @Post('template/remove')
  @ApiOperation({ summary: 'Remove a message template' })
  @ApiResponse({ status: 200, description: 'Message template removed successfully' })
  async removeMessageTemplate(@Body() templateData: { name: string }) {
    await this.communicationService.removeMessageTemplate(templateData.name);
    return { message: 'Message template removed successfully' };
  }

  @Post('batch')
  @ApiOperation({ summary: 'Send batch communication' })
  @ApiResponse({ status: 200, description: 'Batch communication sent successfully' })
  async sendBatchCommunication(@Body() batchData: { type: 'email' | 'sms' | 'push_notification'; recipients: string[]; templateName: string; context: any }) {
    await this.communicationService.sendBatchCommunication(batchData.type, batchData.recipients, batchData.templateName, batchData.context);
    return { message: 'Batch communication sent successfully' };
  }

  @Post('schedule')
  @ApiOperation({ summary: 'Schedule a communication' })
  @ApiResponse({ status: 200, description: 'Communication scheduled successfully' })
  async scheduleCommunication(@Body() scheduleData: { type: 'email' | 'sms' | 'push_notification'; recipient: string; templateName: string; context: any; scheduledTime: Date }) {
    await this.communicationService.scheduleCommunication(scheduleData.type, scheduleData.recipient, scheduleData.templateName, scheduleData.context, scheduleData.scheduledTime);
    return { message: 'Communication scheduled successfully' };
  }

  @Post('preferences')
  @ApiOperation({ summary: 'Update communication preferences' })
  @ApiResponse({ status: 200, description: 'Communication preferences updated successfully' })
  async updateCommunicationPreferences(@Body() preferencesData: { userId: string; preferences: { email: boolean; sms: boolean; push_notifications: boolean } }) {
    await this.communicationService.updateCommunicationPreferences(preferencesData.userId, preferencesData.preferences);
    return { message: 'Communication preferences updated successfully' };
  }

  @Get('health')
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
