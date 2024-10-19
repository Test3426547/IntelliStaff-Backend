import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as nodemailer from 'nodemailer';
import { Twilio } from 'twilio';
import { Throttle } from '@nestjs/throttler';
import { google, calendar_v3 } from 'googleapis';
import * as admin from 'firebase-admin';

@Injectable()
export class CommunicationService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(CommunicationService.name);
  private openaiApiKey: string;
  private emailTransporter: nodemailer.Transporter;
  private twilioClient: Twilio;
  private googleCalendar: calendar_v3.Calendar;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.initializeEmailTransporter();
    this.initializeTwilioClient();
    this.initializeGoogleCalendar();
    this.initializeFirebase();
  }

  private initializeEmailTransporter() {
    this.emailTransporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: true,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  private initializeTwilioClient() {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.twilioClient = new Twilio(accountSid, authToken);
  }

  private initializeGoogleCalendar() {
    const auth = new google.auth.JWT({
      email: this.configService.get<string>('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
      key: this.configService.get<string>('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    this.googleCalendar = google.calendar({ version: 'v3', auth });
  }

  private initializeFirebase() {
    const serviceAccount = {
      projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
      clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
      privateKey: this.configService.get<string>('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }

  @Throttle({ default: { limit: 10, ttl: 300000 } })
  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM'),
        to,
        subject,
        text,
      };

      await this.emailTransporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${to}`);

      await this.logCommunication('email', to, text);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw new HttpException('Failed to send email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Throttle({ default: { limit: 2, ttl: 30000 } })
  async sendSMS(to: string, body: string): Promise<void> {
    try {
      const message = await this.twilioClient.messages.create({
        body,
        to,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
      });

      this.logger.log(`SMS sent successfully to ${to}, SID: ${message.sid}`);

      await this.logCommunication('sms', to, body);
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`, error.stack);
      throw new HttpException('Failed to send SMS', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async generateAIResponse(prompt: string, context: string = ''): Promise<string> {
    try {
      const enhancedPrompt = this.createEnhancedPrompt(prompt, context);
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are an AI assistant for a recruitment platform.' },
            { role: 'user', content: enhancedPrompt }
          ],
          max_tokens: 300,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const aiResponse = response.data.choices[0].message.content.trim();
      this.logger.log('AI response generated successfully');

      await this.logCommunication('ai_interaction', 'AI', enhancedPrompt, aiResponse);

      return aiResponse;
    } catch (error) {
      this.logger.error(`Error generating AI response: ${error.message}`, error.stack);
      throw new HttpException('Failed to generate AI response', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private createEnhancedPrompt(prompt: string, context: string): string {
    return `
      Context: ${context}
      
      Based on the above context, please respond to the following prompt:
      ${prompt}
      
      Please ensure your response is:
      1. Relevant to the recruitment industry
      2. Professional and courteous
      3. Tailored to the specific context provided
      4. Concise but informative
    `;
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async syncGoogleCalendar(userId: string, event: calendar_v3.Schema$Event): Promise<void> {
    try {
      const calendarId = this.configService.get<string>('GOOGLE_CALENDAR_ID');
      
      const createdEvent = await this.googleCalendar.events.insert({
        calendarId: calendarId,
        requestBody: event,
      });

      this.logger.log(`Event created with ID: ${createdEvent.data.id}`);
      await this.logCommunication('calendar_sync', userId, JSON.stringify(event), createdEvent.data.id);
    } catch (error) {
      this.logger.error(`Failed to sync Google Calendar: ${error.message}`, error.stack);
      throw new HttpException('Failed to sync Google Calendar', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async sendPushNotification(userId: string, message: string): Promise<void> {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select('fcm_token')
        .eq('id', userId)
        .single();

      if (error) throw new Error(`Failed to fetch user: ${error.message}`);
      if (!user || !user.fcm_token) throw new Error('User FCM token not found');

      const payload = {
        notification: {
          title: 'AI Recruitment Platform',
          body: message,
        },
      };

      const response = await admin.messaging().sendToDevice(user.fcm_token, payload);
      
      this.logger.log(`Push notification sent to user ${userId}: ${message}`);
      await this.logCommunication('push_notification', userId, message, JSON.stringify(response.results));
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`, error.stack);
      throw new HttpException('Failed to send push notification', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async logCommunication(type: string, recipient: string, content: string, response?: string): Promise<void> {
    try {
      const logEntry = {
        type,
        recipient,
        content,
        response,
        timestamp: new Date().toISOString(),
        metadata: {
          service: 'CommunicationService',
          environment: process.env.NODE_ENV,
        },
      };

      const { error } = await this.supabase.from('communication_logs').insert(logEntry);

      if (error) throw new Error(error.message);

      this.logger.log(`Communication logged: ${JSON.stringify(logEntry)}`);
    } catch (error) {
      this.logger.error(`Error logging communication: ${error.message}`, error.stack);
    }
  }

  async getCommunicationLogs(page: number = 1, limit: number = 50): Promise<{ logs: any[], total: number }> {
    try {
      const { data, error, count } = await this.supabase
        .from('communication_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw new Error(error.message);

      return { logs: data, total: count };
    } catch (error) {
      this.logger.error(`Failed to fetch communication logs: ${error.message}`, error.stack);
      throw new HttpException('Failed to fetch communication logs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
