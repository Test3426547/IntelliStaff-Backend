import { ConfigService } from '@nestjs/config';
import { CommunicationService } from '../communication/communication.service';
export declare class NotificationService {
    private configService;
    private communicationService;
    private supabase;
    private readonly logger;
    constructor(configService: ConfigService, communicationService: CommunicationService);
    createNotification(userId: string, message: string, type: string): Promise<any>;
    getNotifications(userId: string, page?: number, limit?: number): Promise<any>;
    markNotificationAsRead(notificationId: string): Promise<void>;
    private sendNotificationThroughChannel;
}
