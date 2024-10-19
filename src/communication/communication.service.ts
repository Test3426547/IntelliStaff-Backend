import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { retry } from 'rxjs/operators';
import { from } from 'rxjs';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';
import * as twilio from 'twilio';

@Injectable()
export class CommunicationService extends HealthIndicator {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(CommunicationService.name);
  private firebaseApp: admin.app.App;
  private twilioClient: twilio.Twilio;

  constructor(private configService: ConfigService) {
    super();
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.initializeFirebase();
    this.initializeSendGrid();
    this.initializeTwilio();
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

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    return this.retryOperation(async () => {
      try {
        const msg = {
          to,
          from: this.configService.get<string>('EMAIL_FROM'),
          subject,
          text: body,
        };
        await sgMail.send(msg);
        this.logger.log(`Email sent to ${to}`);
      } catch (error) {
        this.logger.error(`Error sending email: ${error.message}`);
        throw new InternalServerErrorException('Failed to send email');
      }
    });
  }

  async sendSMS(to: string, body: string): Promise<void> {
    return this.retryOperation(async () => {
      try {
        const message = await this.twilioClient.messages.create({
          body,
          from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
          to,
        });
        this.logger.log(`SMS sent to ${to}, SID: ${message.sid}`);
      } catch (error) {
        this.logger.error(`Error sending SMS: ${error.message}`);
        throw new InternalServerErrorException('Failed to send SMS');
      }
    });
  }

  async sendPushNotification(userId: string, title: string, body: string): Promise<void> {
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

        const message = {
          notification: { title, body },
          token: data.fcm_token,
        };

        await this.firebaseApp.messaging().send(message);
        this.logger.log(`Push notification sent to user ${userId}`);
      } catch (error) {
        this.logger.error(`Error sending push notification: ${error.message}`);
        throw new InternalServerErrorException('Failed to send push notification');
      }
    });
  }

  async logCommunication(userId: string, type: string, details: any): Promise<void> {
    return this.retryOperation(async () => {
      try {
        const { error } = await this.supabase.from('communications').insert({
          user_id: userId,
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
}
