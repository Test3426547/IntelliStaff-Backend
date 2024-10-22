"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const communication_service_1 = require("./communication.service");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const axios_1 = __importDefault(require("axios"));
const nodemailer = __importStar(require("nodemailer"));
const twilio_1 = require("twilio");
const googleapis_1 = require("googleapis");
const admin = __importStar(require("firebase-admin"));
jest.mock('@supabase/supabase-js');
jest.mock('axios');
jest.mock('nodemailer');
jest.mock('twilio');
jest.mock('googleapis');
jest.mock('firebase-admin');
describe('CommunicationService', () => {
    let service;
    let mockConfigService;
    let mockSupabaseClient;
    let mockEmailTransporter;
    let mockTwilioClient;
    let mockGoogleCalendar;
    let mockFirebaseMessaging;
    beforeEach(async () => {
        mockConfigService = {
            get: jest.fn().mockImplementation((key) => {
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
        supabase_js_1.createClient.mockReturnValue(mockSupabaseClient);
        mockEmailTransporter = {
            sendMail: jest.fn().mockResolvedValue({}),
        };
        nodemailer.createTransport.mockReturnValue(mockEmailTransporter);
        mockTwilioClient = {
            messages: {
                create: jest.fn().mockResolvedValue({ sid: 'mock-sid' }),
            },
        };
        twilio_1.Twilio.mockReturnValue(mockTwilioClient);
        mockGoogleCalendar = {
            events: {
                insert: jest.fn().mockResolvedValue({ data: { id: 'mock-event-id' } }),
            },
        };
        googleapis_1.google.calendar.mockReturnValue(mockGoogleCalendar);
        mockFirebaseMessaging = {
            sendToDevice: jest.fn().mockResolvedValue({ results: [{ messageId: 'mock-message-id' }] }),
        };
        admin.initializeApp.mockReturnValue({});
        admin.messaging.mockReturnValue(() => mockFirebaseMessaging);
        const module = await testing_1.Test.createTestingModule({
            providers: [
                communication_service_1.CommunicationService,
                {
                    provide: config_1.ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();
        service = module.get(communication_service_1.CommunicationService);
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
            axios_1.default.post.mockResolvedValue({
                data: {
                    choices: [{ message: { content: 'AI generated response' } }],
                },
            });
            const response = await service.generateAIResponse('Test prompt', 'Test context');
            expect(response).toBe('AI generated response');
            expect(mockSupabaseClient.insert).toHaveBeenCalled();
        });
        it('should throw an error if AI response generation fails', async () => {
            axios_1.default.post.mockRejectedValue(new Error('OpenAI API error'));
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
//# sourceMappingURL=communication.service.spec.js.map