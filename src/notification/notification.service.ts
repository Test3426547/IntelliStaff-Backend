import { Injectable, Logger } from '@nestjs/common';
import { MlModelManagementService } from '../ml-model-management/ml-model-management.service';
import { CommunicationService } from '../communication/communication.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private mlModelManagementService: MlModelManagementService,
    private communicationService: CommunicationService,
  ) {}

  async sendNotification(userId: string, message: string): Promise<void> {
    try {
      // Use the CommunicationService to send a push notification
      await this.communicationService.sendPushNotification(userId, message);
      this.logger.log(`Notification sent to user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
      throw new Error('Failed to send notification');
    }
  }

  async generateAINotification(userId: string, context: string): Promise<string> {
    try {
      // Use the ML model to generate a personalized notification
      const inputData = { userId, context };
      const result = await this.mlModelManagementService.runInference('notification_generator', inputData);
      return result.generatedNotification;
    } catch (error) {
      this.logger.error(`Failed to generate AI notification: ${error.message}`);
      throw new Error('Failed to generate AI notification');
    }
  }

  async sendAINotification(userId: string, context: string): Promise<void> {
    try {
      const aiGeneratedMessage = await this.generateAINotification(userId, context);
      await this.sendNotification(userId, aiGeneratedMessage);
    } catch (error) {
      this.logger.error(`Failed to send AI notification: ${error.message}`);
      throw new Error('Failed to send AI notification');
    }
  }
}
