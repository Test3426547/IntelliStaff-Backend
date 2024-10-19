import { Test, TestingModule } from '@nestjs/testing';
import { CommunicationService } from './communication.service';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as nodemailer from 'nodemailer';
import { Twilio } from 'twilio';
import { google } from 'googleapis';
import * as admin from 'firebase-admin';

jest.mock('@supabase/supabase-js');
jest.mock('axios');
jest.mock('nodemailer');
jest.mock('twilio');
jest.mock('googleapis');
jest.mock('firebase-admin');

describe('CommunicationService', () => {
  let service: CommunicationService;
  let mockConfigService: Partial<ConfigService>;
  let mockSupabaseClient: any;
  let mockEmailTransporter: any;
  let mockTwilioClient: any;
  let mockGoogleCalendar: any;
  let mockFirebaseMessaging: any;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        const config = {
          SUPABASE_URL: 'https://example.supabase.co',
          SUPABASE_KEY: 'mock-key',
          OPENAI_API_KEY: 'mock-openai-key',
          SMTP_HOST: 'smtp.example.com',
          SMTP_PORT: 587,
          SMTP_USER: 'user@example.com',
          SMTP_PASSWORD: 'password',
          EMAIL_FROM: 'noreply@example.com',
          TWILIO_ACCOUNT_SID: 'mock-account-sid',
          TWILIO_AUTH_TOKEN: 'mock-auth-token',
          TWILIO_PHONE_NUMBER: '+1234567890',
          GOOGLE_SERVICE_ACCOUNT_EMAIL: 'service@example.com',
          GOOGLE_PRIVATE_KEY: 'mock-private-key',
          GOOGLE_CALENDAR_ID: 'primary',
          FIREBASE_PROJECT_ID: 'mock-project-id',
          FIREBASE_CLIENT_EMAIL: 'mock-client-email',
          FIREBASE_PRIVATE_KEY: 'mock-private-key',
        };
        return config[key];
      }),
    };

    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { fcm_token: 'mock-fcm-token' }, error: null }),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    mockEmailTransporter = {
      sendMail: jest.fn().mockResolvedValue({}),
    };

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockEmailTransporter);

    mockTwilioClient = {
      messages: {
        create: jest.fn().mockResolvedValue({ sid: 'mock-sid' }),
      },
    };

    (Twilio as jest.Mock).mockReturnValue(mockTwilioClient);

    mockGoogleCalendar = {
      events: {
        insert: jest.fn().mockResolvedValue({ data: { id: 'mock-event-id' } }),
      },
    };

    (google.calendar as jest.Mock).mockReturnValue(mockGoogleCalendar);

    mockFirebaseMessaging = {
      sendToDevice: jest.fn().mockResolvedValue({ results: [{ messageId: 'mock-message-id' }] }),
    };

    (admin.initializeApp as jest.Mock).mockReturnValue({});
    (admin.messaging as jest.Mock).mockReturnValue(() => mockFirebaseMessaging);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunicationService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CommunicationService>(CommunicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      await service.sendEmail('test@example.com', 'Test Subject', 'Test Content');
      expect(mockEmailTransporter.sendMail).toHaveBeenCalled();
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });

    it('should throw an error if email sending fails', async () => {
      mockEmailTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));
      await expect(service.sendEmail('test@example.com', 'Test Subject', 'Test Content')).rejects.toThrow('Failed to send email');
    });
  });

  describe('sendSMS', () => {
    it('should send an SMS successfully', async () => {
      await service.sendSMS('+1234567890', 'Test SMS');
      expect(mockTwilioClient.messages.create).toHaveBeenCalled();
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });

    it('should throw an error if SMS sending fails', async () => {
      mockTwilioClient.messages.create.mockRejectedValue(new Error('Twilio error'));
      await expect(service.sendSMS('+1234567890', 'Test SMS')).rejects.toThrow('Failed to send SMS');
    });
  });

  describe('generateAIResponse', () => {
    it('should generate an AI response successfully', async () => {
      (axios.post as jest.Mock).mockResolvedValue({
        data: {
          choices: [{ message: { content: 'AI generated response' } }],
        },
      });

      const response = await service.generateAIResponse('Test prompt', 'Test context');
      expect(response).toBe('AI generated response');
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });

    it('should throw an error if AI response generation fails', async () => {
      (axios.post as jest.Mock).mockRejectedValue(new Error('OpenAI API error'));
      await expect(service.generateAIResponse('Test prompt', 'Test context')).rejects.toThrow('Failed to generate AI response');
    });
  });

  describe('getCommunicationLogs', () => {
    it('should return communication logs', async () => {
      const mockLogs = [{ id: 1, type: 'email', recipient: 'test@example.com', content: 'Test content' }];
      mockSupabaseClient.range.mockResolvedValue({ data: mockLogs, error: null, count: 1 });

      const result = await service.getCommunicationLogs();
      expect(result.logs).toEqual(mockLogs);
      expect(result.total).toBe(1);
    });

    it('should throw an error if fetching logs fails', async () => {
      mockSupabaseClient.range.mockResolvedValue({ data: null, error: new Error('Database error'), count: null });
      await expect(service.getCommunicationLogs()).rejects.toThrow('Failed to fetch communication logs');
    });
  });

  describe('syncGoogleCalendar', () => {
    it('should sync Google Calendar successfully', async () => {
      const mockEvent = {
        summary: 'Test Event',
        location: 'Test Location',
        description: 'Test Description',
        start: {
          dateTime: '2023-01-01T09:00:00-07:00',
          timeZone: 'America/Los_Angeles',
        },
        end: {
          dateTime: '2023-01-01T17:00:00-07:00',
          timeZone: 'America/Los_Angeles',
        },
      };

      await service.syncGoogleCalendar('user123', mockEvent);
      expect(mockGoogleCalendar.events.insert).toHaveBeenCalled();
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });

    it('should throw an error if Google Calendar sync fails', async () => {
      mockGoogleCalendar.events.insert.mockRejectedValue(new Error('Google Calendar API error'));
      await expect(service.syncGoogleCalendar('user123', {})).rejects.toThrow('Failed to sync Google Calendar');
    });
  });

  describe('sendPushNotification', () => {
    it('should send a push notification successfully', async () => {
      await service.sendPushNotification('user123', 'Test notification');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('fcm_token');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'user123');
      expect(mockSupabaseClient.single).toHaveBeenCalled();
      expect(mockFirebaseMessaging.sendToDevice).toHaveBeenCalledWith('mock-fcm-token', {
        notification: {
          title: 'AI Recruitment Platform',
          body: 'Test notification',
        },
      });
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });

    it('should throw an error if user FCM token is not found', async () => {
      mockSupabaseClient.single.mockResolvedValue({ data: null, error: null });
      await expect(service.sendPushNotification('user123', 'Test notification')).rejects.toThrow('User FCM token not found');
    });

    it('should throw an error if sending push notification fails', async () => {
      mockFirebaseMessaging.sendToDevice.mockRejectedValue(new Error('Failed to send notification'));
      await expect(service.sendPushNotification('user123', 'Test notification')).rejects.toThrow('Failed to send push notification');
    });
  });
});
