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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CommunicationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const terminus_1 = require("@nestjs/terminus");
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
const admin = __importStar(require("firebase-admin"));
const sgMail = __importStar(require("@sendgrid/mail"));
const twilio = __importStar(require("twilio"));
const Handlebars = __importStar(require("handlebars"));
const schedule_1 = require("@nestjs/schedule");
let CommunicationService = CommunicationService_1 = class CommunicationService extends terminus_1.HealthIndicator {
    constructor(configService) {
        super();
        this.configService = configService;
        this.logger = new common_1.Logger(CommunicationService_1.name);
        this.messageTemplates = new Map();
        this.scheduledCommunications = [];
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
        this.initializeFirebase();
        this.initializeSendGrid();
        this.initializeTwilio();
        this.initializeMessageTemplates();
    }
    initializeFirebase() {
        const firebaseConfig = {
            projectId: this.configService.get('FIREBASE_PROJECT_ID'),
            clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
            privateKey: this.configService.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
        };
        this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig),
        });
    }
    initializeSendGrid() {
        sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));
    }
    initializeTwilio() {
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        this.twilioClient = twilio(accountSid, authToken);
    }
    initializeMessageTemplates() {
        const emailTemplate = Handlebars.compile('Hello {{name}}, {{message}}');
        const smsTemplate = Handlebars.compile('{{message}}');
        const pushNotificationTemplate = Handlebars.compile('{{title}}: {{body}}');
        this.messageTemplates.set('email', emailTemplate);
        this.messageTemplates.set('sms', smsTemplate);
        this.messageTemplates.set('pushNotification', pushNotificationTemplate);
    }
    async checkHealth() {
        try {
            const { data, error } = await this.supabase.from('communications').select('id').limit(1);
            if (error)
                throw error;
            return this.getStatus('communication_service_db', true, { message: 'Communication Service DB is healthy' });
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error.message}`);
            throw new terminus_1.HealthCheckError('Communication Service DB check failed', error);
        }
    }
    async retryOperation(operation, maxRetries = 3) {
        return (0, rxjs_1.from)(operation()).pipe((0, operators_1.retry)({
            count: maxRetries,
            delay: (error, retryCount) => {
                this.logger.warn(`Retrying operation. Attempt ${retryCount} of ${maxRetries}`);
                return Math.pow(2, retryCount) * 1000;
            }
        })).toPromise();
    }
    async sendEmail(to, subject, templateName, context) {
        return this.retryOperation(async () => {
            try {
                const template = this.messageTemplates.get(templateName);
                if (!template) {
                    throw new Error(`Template ${templateName} not found`);
                }
                const body = template(context);
                const msg = {
                    to,
                    from: this.configService.get('EMAIL_FROM'),
                    subject,
                    text: body,
                    html: body,
                };
                await sgMail.send(msg);
                this.logger.log(`Email sent to ${to}`);
                await this.logCommunication(to, 'email', { subject, templateName, context });
            }
            catch (error) {
                this.logger.error(`Error sending email: ${error.message}`);
                throw new common_1.InternalServerErrorException('Failed to send email');
            }
        });
    }
    async sendSMS(to, templateName, context) {
        return this.retryOperation(async () => {
            try {
                const template = this.messageTemplates.get(templateName);
                if (!template) {
                    throw new Error(`Template ${templateName} not found`);
                }
                const body = template(context);
                const message = await this.twilioClient.messages.create({
                    body,
                    from: this.configService.get('TWILIO_PHONE_NUMBER'),
                    to,
                });
                this.logger.log(`SMS sent to ${to}, SID: ${message.sid}`);
                await this.logCommunication(to, 'sms', { templateName, context });
            }
            catch (error) {
                this.logger.error(`Error sending SMS: ${error.message}`);
                throw new common_1.InternalServerErrorException('Failed to send SMS');
            }
        });
    }
    async sendPushNotification(userId, templateName, context) {
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
                const template = this.messageTemplates.get(templateName);
                if (!template) {
                    throw new Error(`Template ${templateName} not found`);
                }
                const { title, body } = JSON.parse(template(context));
                const message = {
                    notification: { title, body },
                    token: data.fcm_token,
                };
                await this.firebaseApp.messaging().send(message);
                this.logger.log(`Push notification sent to user ${userId}`);
                await this.logCommunication(userId, 'push_notification', { templateName, context });
            }
            catch (error) {
                this.logger.error(`Error sending push notification: ${error.message}`);
                throw new common_1.InternalServerErrorException('Failed to send push notification');
            }
        });
    }
    async logCommunication(recipientId, type, details) {
        return this.retryOperation(async () => {
            try {
                const { error } = await this.supabase.from('communications').insert({
                    recipient_id: recipientId,
                    type,
                    details,
                    timestamp: new Date().toISOString(),
                });
                if (error)
                    throw new Error(`Failed to log communication: ${error.message}`);
            }
            catch (error) {
                this.logger.error(`Error logging communication: ${error.message}`);
                throw new common_1.InternalServerErrorException('Failed to log communication');
            }
        });
    }
    async getCommunicationHistory(recipientId, page = 1, limit = 10) {
        return this.retryOperation(async () => {
            try {
                const { data, error, count } = await this.supabase
                    .from('communications')
                    .select('*', { count: 'exact' })
                    .eq('recipient_id', recipientId)
                    .order('timestamp', { ascending: false })
                    .range((page - 1) * limit, page * limit - 1);
                if (error)
                    throw new Error(`Failed to fetch communication history: ${error.message}`);
                return { history: data, total: count };
            }
            catch (error) {
                this.logger.error(`Error fetching communication history: ${error.message}`);
                throw new common_1.InternalServerErrorException('Failed to fetch communication history');
            }
        });
    }
    async addMessageTemplate(name, template) {
        try {
            const compiledTemplate = Handlebars.compile(template);
            this.messageTemplates.set(name, compiledTemplate);
            this.logger.log(`Message template '${name}' added successfully`);
        }
        catch (error) {
            this.logger.error(`Error adding message template: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to add message template');
        }
    }
    async removeMessageTemplate(name) {
        if (this.messageTemplates.has(name)) {
            this.messageTemplates.delete(name);
            this.logger.log(`Message template '${name}' removed successfully`);
        }
        else {
            this.logger.warn(`Message template '${name}' not found`);
        }
    }
    async sendBatchCommunication(type, recipients, templateName, context) {
        const sendMethod = {
            email: this.sendEmail.bind(this),
            sms: this.sendSMS.bind(this),
            push_notification: this.sendPushNotification.bind(this),
        }[type];
        if (!sendMethod) {
            throw new Error(`Invalid communication type: ${type}`);
        }
        const batchSize = 100;
        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);
            await Promise.all(batch.map(recipient => sendMethod(recipient, templateName, context)));
        }
    }
    async scheduleCommunication(type, recipient, templateName, context, scheduledTime) {
        this.scheduledCommunications.push({
            type,
            recipient,
            templateName,
            context,
            scheduledTime,
        });
        this.logger.log(`Communication scheduled for ${recipient} at ${scheduledTime}`);
    }
    async processScheduledCommunications() {
        const now = new Date();
        const communicationsToSend = this.scheduledCommunications.filter(comm => comm.scheduledTime <= now);
        for (const comm of communicationsToSend) {
            try {
                switch (comm.type) {
                    case 'email':
                        await this.sendEmail(comm.recipient, 'Scheduled Email', comm.templateName, comm.context);
                        break;
                    case 'sms':
                        await this.sendSMS(comm.recipient, comm.templateName, comm.context);
                        break;
                    case 'push_notification':
                        await this.sendPushNotification(comm.recipient, comm.templateName, comm.context);
                        break;
                }
                this.logger.log(`Scheduled communication sent to ${comm.recipient}`);
            }
            catch (error) {
                this.logger.error(`Error sending scheduled communication: ${error.message}`);
            }
        }
        this.scheduledCommunications = this.scheduledCommunications.filter(comm => comm.scheduledTime > now);
    }
    async updateCommunicationPreferences(userId, preferences) {
        return this.retryOperation(async () => {
            try {
                const { error } = await this.supabase
                    .from('user_preferences')
                    .upsert(Object.assign({ user_id: userId }, preferences), { onConflict: 'user_id' });
                if (error)
                    throw new Error(`Failed to update communication preferences: ${error.message}`);
                this.logger.log(`Communication preferences updated for user ${userId}`);
            }
            catch (error) {
                this.logger.error(`Error updating communication preferences: ${error.message}`);
                throw new common_1.InternalServerErrorException('Failed to update communication preferences');
            }
        });
    }
    async checkCommunicationPreferences(userId, type) {
        const { data, error } = await this.supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (error) {
            this.logger.error(`Error fetching communication preferences: ${error.message}`);
            return true;
        }
        switch (type) {
            case 'email':
                return data.email;
            case 'sms':
                return data.sms;
            case 'push_notification':
                return data.push_notifications;
            default:
                return true;
        }
    }
};
exports.CommunicationService = CommunicationService;
__decorate([
    (0, schedule_1.Cron)('* * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommunicationService.prototype, "processScheduledCommunications", null);
exports.CommunicationService = CommunicationService = CommunicationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CommunicationService);
//# sourceMappingURL=communication.service.js.map