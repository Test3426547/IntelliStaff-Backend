import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { retry, catchError } from 'rxjs/operators';
import { from, Observable, throwError } from 'rxjs';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';
import { Twilio } from 'twilio';
import * as Handlebars from 'handlebars';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CommunicationService extends HealthIndicator {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(CommunicationService.name);
  private firebaseApp: admin.app.App;
  private twilioClient: Twilio;
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
    this.twilioClient = new Twilio(accountSid, authToken);
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

  private retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3): Observable<T> {
    return from(operation()).pipe(
      retry({
        count: maxRetries,
        delay: (error, retryCount) => {
          this.logger.warn(`Retrying operation. Attempt ${retryCount} of ${maxRetries}`);
          return from(new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000)));
        }
      }),
      catchError((error) => {
        this.logger.error(`Operation failed after ${maxRetries} retries: ${error.message}`);
        return throwError(() => new Error(`Operation failed after ${maxRetries} retries: ${error.message}`));
      })
    );
  }

  async sendEmail(to: string, subject: string, templateName: string, context: any): Promise<void> {
    const template = this.messageTemplates.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }
    const html = template(context);
    const msg = {
      to,
      from: this.configService.get<string>('EMAIL_FROM'),
      subject,
      html,
    };
    try {
      await sgMail.send(msg);
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendSMS(to: string, templateName: string, context: any): Promise<void> {
    const template = this.messageTemplates.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }
    const message = template(context);
    try {
      await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to,
      });
      this.logger.log(`SMS sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`);
      throw new InternalServerErrorException('Failed to send SMS');
    }
  }

  async sendPushNotification(userId: string, templateName: string, context: any): Promise<void> {
    const template = this.messageTemplates.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }
    const message = template(context);
    try {
      await this.firebaseApp.messaging().send({
        token: userId,
        notification: {
          title: context.title,
          body: message,
        },
      });
      this.logger.log(`Push notification sent to ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      throw new InternalServerErrorException('Failed to send push notification');
    }
  }

  async getCommunicationHistory(recipientId: string, page: number, limit: number): Promise<any> {
    try {
      const { data, error, count } = await this.supabase
        .from('communications')
        .select('*', { count: 'exact' })
        .eq('recipient_id', recipientId)
        .range((page - 1) * limit, page * limit - 1)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return { data, total: count };
    } catch (error) {
      this.logger.error(`Failed to get communication history: ${error.message}`);
      throw new InternalServerErrorException('Failed to get communication history');
    }
  }

  async addMessageTemplate(name: string, template: string): Promise<void> {
    try {
      const compiledTemplate = Handlebars.compile(template);
      this.messageTemplates.set(name, compiledTemplate);
      this.logger.log(`Message template ${name} added successfully`);
    } catch (error) {
      this.logger.error(`Failed to add message template: ${error.message}`);
      throw new InternalServerErrorException('Failed to add message template');
    }
  }

  async removeMessageTemplate(name: string): Promise<void> {
    if (this.messageTemplates.has(name)) {
      this.messageTemplates.delete(name);
      this.logger.log(`Message template ${name} removed successfully`);
    } else {
      throw new Error(`Template ${name} not found`);
    }
  }

  async sendBatchCommunication(type: string, recipients: string[], templateName: string, context: any): Promise<void> {
    for (const recipient of recipients) {
      try {
        switch (type) {
          case 'email':
            await this.sendEmail(recipient, context.subject, templateName, context);
            break;
          case 'sms':
            await this.sendSMS(recipient, templateName, context);
            break;
          case 'push':
            await this.sendPushNotification(recipient, templateName, context);
            break;
          default:
            throw new Error(`Invalid communication type: ${type}`);
        }
      } catch (error) {
        this.logger.error(`Failed to send ${type} to ${recipient}: ${error.message}`);
      }
    }
  }

  async scheduleCommunication(type: string, recipient: string, templateName: string, context: any, scheduledTime: Date): Promise<void> {
    this.scheduledCommunications.push({ type, recipient, templateName, context, scheduledTime });
    this.logger.log(`Communication scheduled for ${recipient} at ${scheduledTime}`);
  }

  @Cron('0 * * * * *') // Run every minute
  async processScheduledCommunications() {
    const now = new Date();
    const communicationsToSend = this.scheduledCommunications.filter(comm => comm.scheduledTime <= now);

    for (const comm of communicationsToSend) {
      try {
        switch (comm.type) {
          case 'email':
            await this.sendEmail(comm.recipient, comm.context.subject, comm.templateName, comm.context);
            break;
          case 'sms':
            await this.sendSMS(comm.recipient, comm.templateName, comm.context);
            break;
          case 'push':
            await this.sendPushNotification(comm.recipient, comm.templateName, comm.context);
            break;
        }
        this.logger.log(`Scheduled communication sent to ${comm.recipient}`);
      } catch (error) {
        this.logger.error(`Failed to send scheduled communication: ${error.message}`);
      }
    }

    this.scheduledCommunications = this.scheduledCommunications.filter(comm => comm.scheduledTime > now);
  }

  async updateCommunicationPreferences(userId: string, preferences: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_communication_preferences')
        .upsert({ user_id: userId, ...preferences });

      if (error) throw error;

      this.logger.log(`Communication preferences updated for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to update communication preferences: ${error.message}`);
      throw new InternalServerErrorException('Failed to update communication preferences');
    }
  }
}
