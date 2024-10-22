import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
export declare class CommunicationService extends HealthIndicator {
    private configService;
    private supabase;
    private readonly logger;
    private firebaseApp;
    private twilioClient;
    private messageTemplates;
    private scheduledCommunications;
    constructor(configService: ConfigService);
    private initializeFirebase;
    private initializeSendGrid;
    private initializeTwilio;
    private initializeMessageTemplates;
    checkHealth(): Promise<HealthIndicatorResult>;
    private retryOperation;
    sendEmail(to: string, subject: string, templateName: string, context: any): Promise<void>;
    sendSMS(to: string, templateName: string, context: any): Promise<void>;
    sendPushNotification(userId: string, templateName: string, context: any): Promise<void>;
    logCommunication(recipientId: string, type: string, details: any): Promise<void>;
    getCommunicationHistory(recipientId: string, page?: number, limit?: number): Promise<any>;
    addMessageTemplate(name: string, template: string): Promise<void>;
    removeMessageTemplate(name: string): Promise<void>;
    sendBatchCommunication(type: 'email' | 'sms' | 'push_notification', recipients: string[], templateName: string, context: any): Promise<void>;
    scheduleCommunication(type: 'email' | 'sms' | 'push_notification', recipient: string, templateName: string, context: any, scheduledTime: Date): Promise<void>;
    processScheduledCommunications(): Promise<void>;
    updateCommunicationPreferences(userId: string, preferences: {
        email: boolean;
        sms: boolean;
        push_notifications: boolean;
    }): Promise<void>;
    private checkCommunicationPreferences;
}
