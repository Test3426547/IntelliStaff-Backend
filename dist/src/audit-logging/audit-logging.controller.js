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
exports.AuditLoggingController = void 0;
const common_1 = require("@nestjs/common");
const audit_logging_service_1 = require("./audit-logging.service");
const auth_guard_1 = require("../user-management/auth.guard");
const swagger_1 = require("@nestjs/swagger");
const terminus_1 = require("@nestjs/terminus");
let AuditLoggingController = class AuditLoggingController {
    constructor(auditLoggingService, health) {
        this.auditLoggingService = auditLoggingService;
        this.health = health;
    }
    async logActivity(activityData) {
        await this.auditLoggingService.logActivity(activityData.userId, activityData.action, activityData.details);
        return { message: 'Activity logged successfully' };
    }
    async generateAuditTrail(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return this.auditLoggingService.generateAuditTrail(start, end);
    }
    async createAlert(alertData) {
        await this.auditLoggingService.createAlert(alertData.type, alertData.message, alertData.severity);
        return { message: 'Alert created successfully' };
    }
    async checkHealth() {
        return this.health.check([
            () => this.auditLoggingService.checkHealth(),
        ]);
    }
};
exports.AuditLoggingController = AuditLoggingController;
__decorate([
    (0, common_1.Post)('log-activity'),
    (0, swagger_1.ApiOperation)({ summary: 'Log an activity' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Activity logged successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuditLoggingController.prototype, "logActivity", null);
__decorate([
    (0, common_1.Get)('audit-trail'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate audit trail' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Audit trail generated successfully' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuditLoggingController.prototype, "generateAuditTrail", null);
__decorate([
    (0, common_1.Post)('create-alert'),
    (0, swagger_1.ApiOperation)({ summary: 'Create an alert' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Alert created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuditLoggingController.prototype, "createAlert", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check the health of the Audit and Logging service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuditLoggingController.prototype, "checkHealth", null);
exports.AuditLoggingController = AuditLoggingController = __decorate([
    (0, swagger_1.ApiTags)('audit-logging'),
    (0, common_1.Controller)('audit-logging'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [audit_logging_service_1.AuditLoggingService,
        terminus_1.HealthCheckService])
], AuditLoggingController);
//# sourceMappingURL=audit-logging.controller.js.map