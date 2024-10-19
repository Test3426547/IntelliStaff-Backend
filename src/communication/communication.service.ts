import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { retry } from 'rxjs/operators';
import { from } from 'rxjs';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';
import * as twilio from 'twilio';
import * as Handlebars from 'handlebars';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CommunicationService extends HealthIndicator {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(CommunicationService.name);
  private firebaseApp: admin.app.App;
  private twilioClient: twilio.Twilio;
  private messageTemplates: Map<string, Handlebars.TemplateDelegate> = new Map();
  private scheduledCommunications: any[] = [];

  constructor(private configService: ConfigService) {
    super();
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.initializeFirebase();
    this.initializeSendGrid();
    this.initializeTwilio();
    this.initializeMessageTemplates();
  }

  private initializeFirebase() {
    const firebaseConfig = {
      projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
      clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
      privateKey: this.configService.get<string>('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    };
    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
    });
  }

  private initializeSendGrid() {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  private initializeTwilio() {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.twilioClient = twilio(accountSid, authToken);
  }

  private initializeMessageTemplates() {
    // Initialize message templates
    const emailTemplate = Handlebars.compile('Hello {{name}}, {{message}}');
    const smsTemplate = Handlebars.compile('{{message}}');
    const pushNotificationTemplate = Handlebars.compile('{{title}}: {{body}}');

    this.messageTemplates.set('email', emailTemplate);
    this.messageTemplates.set('sms', smsTemplate);
    this.messageTemplates.set('pushNotification', pushNotificationTemplate);
  }

  async checkHealth(): Promise<HealthIndicatorResult> {
    try {
      const { data, error } = await this.supabase.from('communications').select('id').limit(1);
      if (error) throw error;
      return this.getStatus('communication_service_db', true, { message: 'Communication Service DB is healthy' });
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      throw new HealthCheckError('Communication Service DB check failed', error);
    }
  }

  private async retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    return from(operation()).pipe(
      retry({
        count: maxRetries,
        delay: (error, retryCount) => {
          this.logger.warn(`Retrying operation. Attempt ${retryCount} of ${maxRetries}`);
          return Math.pow(2, retryCount) * 1000; // Exponential backoff
        }
      })
    ).toPromise();
  }

  async sendEmail(to: string, subject: string, templateName: string, context: any): Promise<void> {
    return this.retryOperation(async () => {
      try {
        const template = this.messageTemplates.get(templateName);
        if (!template) {
          throw new Error(`Template ${templateName} not found`);
        }

        const body = template(context);
        const msg = {
          to,
          from: this.configService.get<string>('EMAIL_FROM'),
          subject,
          text: body,
          html: body,
        };
        await sgMail.send(msg);
        this.logger.log(`Email sent to ${to}`);
        await this.logCommunication(to, 'email', { subject, templateName, context });
      } catch (error) {
        this.logger.error(`Error sending email: ${error.message}`);
        throw new InternalServerErrorException('Failed to send email');
      }
    });
  }

  async sendSMS(to: string, templateName: string, context: any): Promise<void> {
    return this.retryOperation(async () => {
      try {
        const template = this.messageTemplates.get(templateName);
        if (!template) {
          throw new Error(`Template ${templateName} not found`);
        }

        const body = template(context);
        const message = await this.twilioClient.messages.create({
          body,
          from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
          to,
        });
        this.logger.log(`SMS sent to ${to}, SID: ${message.sid}`);
        await this.logCommunication(to, 'sms', { templateName, context });
      } catch (error) {
        this.logger.error(`Error sending SMS: ${error.message}`);
        throw new InternalServerErrorException('Failed to send SMS');
      }
    });
  }

  async sendPushNotification(userId: string, templateName: string, context: any): Promise<void> {
    return this.retryOperation(async () => {
      try {
        const { data, error } = await this.supabase
          .from('user_devices')
          .select('fcm_token')
          .eq('user_id', userId)
          .single();

        if (error || !data) {
          throw new Error('FCM token not found for user');
        }

        const template = this.messageTemplates.get(templateName);
        if (!template) {
          throw new Error(`Template ${templateName} not found`);
        }

        const { title, body } = JSON.parse(template(context));

        const message = {
          notification: { title, body },
          token: data.fcm_token,
        };

        await this.firebaseApp.messaging().send(message);
        this.logger.log(`Push notification sent to user ${userId}`);
        await this.logCommunication(userId, 'push_notification', { templateName, context });
      } catch (error) {
        this.logger.error(`Error sending push notification: ${error.message}`);
        throw new InternalServerErrorException('Failed to send push notification');
      }
    });
  }

  async logCommunication(recipientId: string, type: string, details: any): Promise<void> {
    return this.retryOperation(async () => {
      try {
        const { error } = await this.supabase.from('communications').insert({
          recipient_id: recipientId,
          type,
          details,
          timestamp: new Date().toISOString(),
        });

        if (error) throw new Error(`Failed to log communication: ${error.message}`);
      } catch (error) {
        this.logger.error(`Error logging communication: ${error.message}`);
        throw new InternalServerErrorException('Failed to log communication');
      }
    });
  }

  async getCommunicationHistory(recipientId: string, page: number = 1, limit: number = 10): Promise<any> {
    return this.retryOperation(async () => {
      try {
        const { data, error, count } = await this.supabase
          .from('communications')
          .select('*', { count: 'exact' })
          .eq('recipient_id', recipientId)
          .order('timestamp', { ascending: false })
          .range((page - 1) * limit, page * limit - 1);

        if (error) throw new Error(`Failed to fetch communication history: ${error.message}`);

        return { history: data, total: count };
      } catch (error) {
        this.logger.error(`Error fetching communication history: ${error.message}`);
        throw new InternalServerErrorException('Failed to fetch communication history');
      }
    });
  }

  async addMessageTemplate(name: string, template: string): Promise<void> {
    try {
      const compiledTemplate = Handlebars.compile(template);
      this.messageTemplates.set(name, compiledTemplate);
      this.logger.log(`Message template '${name}' added successfully`);
    } catch (error) {
      this.logger.error(`Error adding message template: ${error.message}`);
      throw new InternalServerErrorException('Failed to add message template');
    }
  }

  async removeMessageTemplate(name: string): Promise<void> {
    if (this.messageTemplates.has(name)) {
      this.messageTemplates.delete(name);
      this.logger.log(`Message template '${name}' removed successfully`);
    } else {
      this.logger.warn(`Message template '${name}' not found`);
    }
  }

  // New method for batch communication sending
  async sendBatchCommunication(type: 'email' | 'sms' | 'push_notification', recipients: string[], templateName: string, context: any): Promise<void> {
    const sendMethod = {
      email: this.sendEmail.bind(this),
      sms: this.sendSMS.bind(this),
      push_notification: this.sendPushNotification.bind(this),
    }[type];

    if (!sendMethod) {
      throw new Error(`Invalid communication type: ${type}`);
    }

    const batchSize = 100; // Adjust based on rate limits of your communication services
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      await Promise.all(batch.map(recipient => sendMethod(recipient, templateName, context)));
    }
  }

  // New method for scheduling communications
  async scheduleCommunication(type: 'email' | 'sms' | 'push_notification', recipient: string, templateName: string, context: any, scheduledTime: Date): Promise<void> {
    this.scheduledCommunications.push({
      type,
      recipient,
      templateName,
      context,
      scheduledTime,
    });
    this.logger.log(`Communication scheduled for ${recipient} at ${scheduledTime}`);
  }

  // Cron job to process scheduled communications
  @Cron('* * * * *') // Runs every minute
  async processScheduledCommunications() {
    const now = new Date();
    const communicationsToSend = this.scheduledCommunications.filter(comm => comm.scheduledTime <= now);

    for (const comm of communicationsToSend) {
      try {
        switch (comm.type) {
          case 'email':
            await this.sendEmail(comm.recipient, 'Scheduled Email', comm.templateName, comm.context);
            break;
          case 'sms':
            await this.sendSMS(comm.recipient, comm.templateName, comm.context);
            break;
          case 'push_notification':
            await this.sendPushNotification(comm.recipient, comm.templateName, comm.context);
            break;
        }
        this.logger.log(`Scheduled communication sent to ${comm.recipient}`);
      } catch (error) {
        this.logger.error(`Error sending scheduled communication: ${error.message}`);
      }
    }

    // Remove sent communications from the schedule
    this.scheduledCommunications = this.scheduledCommunications.filter(comm => comm.scheduledTime > now);
  }

  // New method for managing communication preferences
  async updateCommunicationPreferences(userId: string, preferences: { email: boolean, sms: boolean, push_notifications: boolean }): Promise<void> {
    return this.retryOperation(async () => {
      try {
        const { error } = await this.supabase
          .from('user_preferences')
          .upsert({ user_id: userId, ...preferences }, { onConflict: 'user_id' });

        if (error) throw new Error(`Failed to update communication preferences: ${error.message}`);
        this.logger.log(`Communication preferences updated for user ${userId}`);
      } catch (error) {
        this.logger.error(`Error updating communication preferences: ${error.message}`);
        throw new InternalServerErrorException('Failed to update communication preferences');
      }
    });
  }

  // New method for checking communication preferences before sending
  private async checkCommunicationPreferences(userId: string, type: 'email' | 'sms' | 'push_notification'): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      this.logger.error(`Error fetching communication preferences: ${error.message}`);
      return true; // Default to allowing communication if preferences can't be fetched
    }

    switch (type) {
      case 'email':
        return data.email;
      case 'sms':
        return data.sms;
      case 'push_notification':
        return data.push_notifications;
      default:
        return true;
    }
  }
}
