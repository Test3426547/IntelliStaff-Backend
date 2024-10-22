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
exports.ErrorHandlingMonitoringController = void 0;
const common_1 = require("@nestjs/common");
const error_handling_monitoring_service_1 = require("./error-handling-monitoring.service");
const auth_guard_1 = require("../user-management/auth.guard");
const swagger_1 = require("@nestjs/swagger");
const terminus_1 = require("@nestjs/terminus");
let ErrorHandlingMonitoringController = class ErrorHandlingMonitoringController {
    constructor(errorHandlingMonitoringService, health) {
        this.errorHandlingMonitoringService = errorHandlingMonitoringService;
        this.health = health;
    }
    async logError(errorData) {
        const error = new Error(errorData.message);
        if (errorData.stack) {
            error.stack = errorData.stack;
        }
        this.errorHandlingMonitoringService.captureException(error, errorData.context);
        return { message: 'Error logged successfully' };
    }
    async logMessage(messageData) {
        this.errorHandlingMonitoringService.captureMessage(messageData.message, messageData.level, messageData.context);
        return { message: 'Message logged successfully' };
    }
    async getErrorLogs(page = 1, limit = 10) {
        return this.errorHandlingMonitoringService.getErrorLogs(page, limit);
    }
    async getPerformanceMetrics(startDate, endDate) {
        return this.errorHandlingMonitoringService.getPerformanceMetrics(new Date(startDate), new Date(endDate));
    }
    async recordPerformanceMetric(metricData) {
        await this.errorHandlingMonitoringService.recordPerformanceMetric(metricData.name, metricData.value);
        return { message: 'Performance metric recorded successfully' };
    }
    async checkHealth() {
        return this.health.check([
            () => this.errorHandlingMonitoringService.checkHealth(),
        ]);
    }
};
exports.ErrorHandlingMonitoringController = ErrorHandlingMonitoringController;
__decorate([
    (0, common_1.Post)('log-error'),
    (0, swagger_1.ApiOperation)({ summary: 'Log an error' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Error logged successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ErrorHandlingMonitoringController.prototype, "logError", null);
__decorate([
    (0, common_1.Post)('log-message'),
    (0, swagger_1.ApiOperation)({ summary: 'Log a message' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Message logged successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ErrorHandlingMonitoringController.prototype, "logMessage", null);
__decorate([
    (0, common_1.Get)('error-logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get error logs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Error logs retrieved successfully' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ErrorHandlingMonitoringController.prototype, "getErrorLogs", null);
__decorate([
    (0, common_1.Get)('performance-metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get performance metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Performance metrics retrieved successfully' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ErrorHandlingMonitoringController.prototype, "getPerformanceMetrics", null);
__decorate([
    (0, common_1.Post)('record-metric'),
    (0, swagger_1.ApiOperation)({ summary: 'Record a performance metric' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Performance metric recorded successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ErrorHandlingMonitoringController.prototype, "recordPerformanceMetric", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check the health of the Error Handling and Monitoring service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ErrorHandlingMonitoringController.prototype, "checkHealth", null);
exports.ErrorHandlingMonitoringController = ErrorHandlingMonitoringController = __decorate([
    (0, swagger_1.ApiTags)('error-handling-monitoring'),
    (0, common_1.Controller)('error-handling-monitoring'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [error_handling_monitoring_service_1.ErrorHandlingMonitoringService,
        terminus_1.HealthCheckService])
], ErrorHandlingMonitoringController);
//# sourceMappingURL=error-handling-monitoring.controller.js.map