import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    createNotification(notificationData: {
        userId: string;
        message: string;
        type: string;
    }): Promise<any>;
    getNotifications(userId: string, page?: number, limit?: number): Promise<any>;
    markNotificationAsRead(id: string): Promise<{
        message: string;
    }>;
}
