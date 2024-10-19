import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { calendar_v3 } from 'googleapis';

@ApiTags('communication')
@Controller('communication')
@UseGuards(ThrottlerGuard)
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Post('send-email')
  @Throttle(10, 300000) // 10 requests per 5 minutes
  @ApiOperation({ summary: 'Send an email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        to: { type: 'string' },
        subject: { type: 'string' },
        text: { type: 'string' },
      },
    },
  })
  async sendEmail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('text') text: string,
  ) {
    await this.communicationService.sendEmail(to, subject, text);
    return { message: 'Email sent successfully' };
  }

  @Post('send-sms')
  @Throttle(2, 30000) // 2 requests per 30 seconds
  @ApiOperation({ summary: 'Send an SMS' })
  @ApiResponse({ status: 200, description: 'SMS sent successfully' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        to: { type: 'string' },
        body: { type: 'string' },
      },
    },
  })
  async sendSMS(
    @Body('to') to: string,
    @Body('body') body: string,
  ) {
    await this.communicationService.sendSMS(to, body);
    return { message: 'SMS sent successfully' };
  }

  @Post('generate-ai-response')
  @Throttle(10, 60000) // 10 requests per minute
  @ApiOperation({ summary: 'Generate AI response' })
  @ApiResponse({ status: 200, description: 'AI response generated successfully' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string' },
      },
    },
  })
  async generateAIResponse(@Body('prompt') prompt: string) {
    const response = await this.communicationService.generateAIResponse(prompt);
    return { response };
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get communication logs' })
  @ApiResponse({ status: 200, description: 'Return communication logs' })
  async getCommunicationLogs() {
    return this.communicationService.getCommunicationLogs();
  }

  @Post('sync-calendar')
  @ApiOperation({ summary: 'Sync Google Calendar' })
  @ApiResponse({ status: 200, description: 'Calendar synced successfully' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        event: { 
          type: 'object',
          properties: {
            summary: { type: 'string' },
            location: { type: 'string' },
            description: { type: 'string' },
            start: { 
              type: 'object',
              properties: {
                dateTime: { type: 'string' },
                timeZone: { type: 'string' },
              },
            },
            end: { 
              type: 'object',
              properties: {
                dateTime: { type: 'string' },
                timeZone: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  async syncGoogleCalendar(
    @Body('userId') userId: string,
    @Body('event') event: calendar_v3.Schema$Event,
  ) {
    await this.communicationService.syncGoogleCalendar(userId, event);
    return { message: 'Calendar synced successfully' };
  }

  @Post('send-push-notification')
  @ApiOperation({ summary: 'Send push notification' })
  @ApiResponse({ status: 200, description: 'Push notification sent successfully' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  async sendPushNotification(
    @Body('userId') userId: string,
    @Body('message') message: string,
  ) {
    await this.communicationService.sendPushNotification(userId, message);
    return { message: 'Push notification sent successfully' };
  }
}
