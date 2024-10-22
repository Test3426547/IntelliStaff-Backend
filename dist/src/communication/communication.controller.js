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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationController = void 0;
const common_1 = require("@nestjs/common");
const communication_service_1 = require("./communication.service");
const auth_guard_1 = require("../user-management/auth.guard");
const swagger_1 = require("@nestjs/swagger");
const terminus_1 = require("@nestjs/terminus");
let CommunicationController = class CommunicationController {
    constructor(communicationService, health) {
        this.communicationService = communicationService;
        this.health = health;
    }
    async sendEmail(emailData) {
        await this.communicationService.sendEmail(emailData.to, emailData.subject, emailData.templateName, emailData.context);
        return { message: 'Email sent successfully' };
    }
    async sendSMS(smsData) {
        await this.communicationService.sendSMS(smsData.to, smsData.templateName, smsData.context);
        return { message: 'SMS sent successfully' };
    }
    async sendPushNotification(notificationData) {
        await this.communicationService.sendPushNotification(notificationData.userId, notificationData.templateName, notificationData.context);
        return { message: 'Push notification sent successfully' };
    }
    async getCommunicationHistory(recipientId, page = 1, limit = 10) {
        return this.communicationService.getCommunicationHistory(recipientId, page, limit);
    }
    async addMessageTemplate(templateData) {
        await this.communicationService.addMessageTemplate(templateData.name, templateData.template);
        return { message: 'Message template added successfully' };
    }
    async removeMessageTemplate(templateData) {
        await this.communicationService.removeMessageTemplate(templateData.name);
        return { message: 'Message template removed successfully' };
    }
    async sendBatchCommunication(batchData) {
        await this.communicationService.sendBatchCommunication(batchData.type, batchData.recipients, batchData.templateName, batchData.context);
        return { message: 'Batch communication sent successfully' };
    }
    async scheduleCommunication(scheduleData) {
        await this.communicationService.scheduleCommunication(scheduleData.type, scheduleData.recipient, scheduleData.templateName, scheduleData.context, scheduleData.scheduledTime);
        return { message: 'Communication scheduled successfully' };
    }
    async updateCommunicationPreferences(preferencesData) {
        await this.communicationService.updateCommunicationPreferences(preferencesData.userId, preferencesData.preferences);
        return { message: 'Communication preferences updated successfully' };
    }
    async checkHealth() {
        return this.health.check([
            () => this.communicationService.checkHealth(),
        ]);
    }
};
exports.CommunicationController = CommunicationController;
__decorate([
    (0, common_1.Post)('email'),
    (0, swagger_1.ApiOperation)({ summary: 'Send an email using a template' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email sent successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "sendEmail", null);
__decorate([
    (0, common_1.Post)('sms'),
    (0, swagger_1.ApiOperation)({ summary: 'Send an SMS using a template' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SMS sent successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "sendSMS", null);
__decorate([
    (0, common_1.Post)('push-notification'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a push notification using a template' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Push notification sent successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "sendPushNotification", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get communication history for a recipient' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Communication history retrieved successfully' }),
    __param(0, (0, common_1.Query)('recipientId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "getCommunicationHistory", null);
__decorate([
    (0, common_1.Post)('template'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a new message template' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Message template added successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "addMessageTemplate", null);
__decorate([
    (0, common_1.Post)('template/remove'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a message template' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Message template removed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "removeMessageTemplate", null);
__decorate([
    (0, common_1.Post)('batch'),
    (0, swagger_1.ApiOperation)({ summary: 'Send batch communication' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Batch communication sent successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "sendBatchCommunication", null);
__decorate([
    (0, common_1.Post)('schedule'),
    (0, swagger_1.ApiOperation)({ summary: 'Schedule a communication' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Communication scheduled successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "scheduleCommunication", null);
__decorate([
    (0, common_1.Post)('preferences'),
    (0, swagger_1.ApiOperation)({ summary: 'Update communication preferences' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Communication preferences updated successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "updateCommunicationPreferences", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check the health of the Communication service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommunicationController.prototype, "checkHealth", null);
exports.CommunicationController = CommunicationController = __decorate([
    (0, swagger_1.ApiTags)('communication'),
    (0, common_1.Controller)('communication'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [communication_service_1.CommunicationService,
        terminus_1.HealthCheckService])
], CommunicationController);
//# sourceMappingURL=communication.controller.js.map