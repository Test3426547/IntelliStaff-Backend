import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CommunicationService } from '../communication/communication.service';

@Injectable()
export class NotificationService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private configService: ConfigService,
    private communicationService: CommunicationService
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
  }

  async createNotification(userId: string, message: string, type: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert({ user_id: userId, message, type, read: false })
        .single();

      if (error) throw new Error(`Failed to create notification: ${error.message}`);

      // Send notification through appropriate channel
      await this.sendNotificationThroughChannel(userId, message, type);

      return data;
    } catch (error) {
      this.logger.error(`Error creating notification: ${error.message}`);
      throw error;
    }
  }

  async getNotifications(userId: string, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const { data, error, count } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw new Error(`Failed to fetch notifications: ${error.message}`);

      return { notifications: data, total: count };
    } catch (error) {
      this.logger.error(`Error fetching notifications: ${error.message}`);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw new Error(`Failed to mark notification as read: ${error.message}`);
    } catch (error) {
      this.logger.error(`Error marking notification as read: ${error.message}`);
      throw error;
    }
  }

  private async sendNotificationThroughChannel(userId: string, message: string, type: string): Promise<void> {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select('email, phone')
        .eq('id', userId)
        .single();

      if (error) throw new Error(`Failed to fetch user details: ${error.message}`);

      switch (type) {
        case 'email':
          await this.communicationService.sendEmail(user.email, 'New Notification', 'notification_email', { message });
          break;
        case 'sms':
          await this.communicationService.sendSMS(user.phone, 'notification_sms', { message });
          break;
        case 'push':
          await this.communicationService.sendPushNotification(userId, 'notification_push', { message });
          break;
        default:
          this.logger.warn(`Unknown notification type: ${type}`);
      }
    } catch (error) {
      this.logger.error(`Error sending notification through channel: ${error.message}`);
    }
  }
}
