import { CommunicationService } from './communication.service';
import { HealthCheckService } from '@nestjs/terminus';
export declare class CommunicationController {
    private readonly communicationService;
    private health;
    constructor(communicationService: CommunicationService, health: HealthCheckService);
    sendEmail(emailData: {
        to: string;
        subject: string;
        templateName: string;
        context: any;
    }): Promise<{
        message: string;
    }>;
    sendSMS(smsData: {
        to: string;
        templateName: string;
        context: any;
    }): Promise<{
        message: string;
    }>;
    sendPushNotification(notificationData: {
        userId: string;
        templateName: string;
        context: any;
    }): Promise<{
        message: string;
    }>;
    getCommunicationHistory(recipientId: string, page?: number, limit?: number): Promise<any>;
    addMessageTemplate(templateData: {
        name: string;
        template: string;
    }): Promise<{
        message: string;
    }>;
    removeMessageTemplate(templateData: {
        name: string;
    }): Promise<{
        message: string;
    }>;
    sendBatchCommunication(batchData: {
        type: 'email' | 'sms' | 'push_notification';
        recipients: string[];
        templateName: string;
        context: any;
    }): Promise<{
        message: string;
    }>;
    scheduleCommunication(scheduleData: {
        type: 'email' | 'sms' | 'push_notification';
        recipient: string;
        templateName: string;
        context: any;
        scheduledTime: Date;
    }): Promise<{
        message: string;
    }>;
    updateCommunicationPreferences(preferencesData: {
        userId: string;
        preferences: {
            email: boolean;
            sms: boolean;
            push_notifications: boolean;
        };
    }): Promise<{
        message: string;
    }>;
    checkHealth(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
