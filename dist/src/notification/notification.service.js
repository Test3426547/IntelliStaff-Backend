"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const communication_service_1 = require("../communication/communication.service");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(configService, communicationService) {
        this.configService = configService;
        this.communicationService = communicationService;
        this.logger = new common_1.Logger(NotificationService_1.name);
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
    }
    async createNotification(userId, message, type) {
        try {
            const { data, error } = await this.supabase
                .from('notifications')
                .insert({ user_id: userId, message, type, read: false })
                .single();
            if (error)
                throw new Error(`Failed to create notification: ${error.message}`);
            await this.sendNotificationThroughChannel(userId, message, type);
            return data;
        }
        catch (error) {
            this.logger.error(`Error creating notification: ${error.message}`);
            throw error;
        }
    }
    async getNotifications(userId, page = 1, limit = 10) {
        try {
            const { data, error, count } = await this.supabase
                .from('notifications')
                .select('*', { count: 'exact' })
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1);
            if (error)
                throw new Error(`Failed to fetch notifications: ${error.message}`);
            return { notifications: data, total: count };
        }
        catch (error) {
            this.logger.error(`Error fetching notifications: ${error.message}`);
            throw error;
        }
    }
    async markNotificationAsRead(notificationId) {
        try {
            const { error } = await this.supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId);
            if (error)
                throw new Error(`Failed to mark notification as read: ${error.message}`);
        }
        catch (error) {
            this.logger.error(`Error marking notification as read: ${error.message}`);
            throw error;
        }
    }
    async sendNotificationThroughChannel(userId, message, type) {
        try {
            const { data: user, error } = await this.supabase
                .from('users')
                .select('email, phone')
                .eq('id', userId)
                .single();
            if (error)
                throw new Error(`Failed to fetch user details: ${error.message}`);
            switch (type) {
                case 'email':
                    await this.communicationService.sendEmail(user.email, 'New Notification', 'notification_email', { message });
                    break;
                case 'sms':
                    await this.communicationService.sendSMS(user.phone, 'notification_sms', { message });
                    break;
                case 'push':
                    await this.communicationService.sendPushNotification(userId, 'notification_push', { message });
                    break;
                default:
                    this.logger.warn(`Unknown notification type: ${type}`);
            }
        }
        catch (error) {
            this.logger.error(`Error sending notification through channel: ${error.message}`);
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        communication_service_1.CommunicationService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map