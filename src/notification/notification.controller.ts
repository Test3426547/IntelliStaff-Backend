import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../user-management/auth.guard';

@ApiTags('notification')
@Controller('notification')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a notification' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  async sendNotification(
    @Body('userId') userId: string,
    @Body('message') message: string,
  ) {
    await this.notificationService.sendNotification(userId, message);
    return { message: 'Notification sent successfully' };
  }

  @Post('send-ai')
  @ApiOperation({ summary: 'Send an AI-generated notification' })
  @ApiResponse({ status: 200, description: 'AI-generated notification sent successfully' })
  async sendAINotification(
    @Body('userId') userId: string,
    @Body('context') context: string,
  ) {
    await this.notificationService.sendAINotification(userId, context);
    return { message: 'AI-generated notification sent successfully' };
  }
}
