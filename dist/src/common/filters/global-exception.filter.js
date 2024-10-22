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
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const audit_logging_service_1 = require("../../audit-logging/audit-logging.service");
const error_codes_1 = require("../error-codes");
const sentry_service_1 = require("../services/sentry.service");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    constructor(auditLoggingService, sentryService) {
        this.auditLoggingService = auditLoggingService;
        this.sentryService = sentryService;
        this.logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    }
    async catch(exception, host) {
        var _a;
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let errorCode = error_codes_1.ErrorCodes.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            message = exception.message;
            errorCode = this.getErrorCodeFromStatus(status);
        }
        else if (exception instanceof error_codes_1.AppError) {
            errorCode = exception.code;
            message = exception.message;
            status = this.getStatusFromErrorCode(errorCode);
        }
        const errorResponse = {
            statusCode: status,
            errorCode: errorCode,
            message: message,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
        };
        this.logger.error(`${request.method} ${request.url}`, exception instanceof Error ? exception.stack : 'Unknown error', GlobalExceptionFilter_1.name);
        this.sentryService.captureException(exception);
        this.sentryService.setExtra('request_details', {
            url: request.url,
            method: request.method,
            headers: request.headers,
            body: request.body,
            query: request.query,
            params: request.params,
        });
        if (request.user) {
            this.sentryService.setUser({
                id: request.user.id,
                email: request.user.email,
                username: request.user.username,
            });
        }
        this.sentryService.setTag('error_code', errorCode);
        this.sentryService.setTag('status_code', status.toString());
        await this.auditLoggingService.logAction('system', 'error', Object.assign(Object.assign({}, errorResponse), { userId: (_a = request.user) === null || _a === void 0 ? void 0 : _a.id }));
        response.status(status).json(errorResponse);
    }
    getErrorCodeFromStatus(status) {
        switch (status) {
            case common_1.HttpStatus.BAD_REQUEST:
                return error_codes_1.ErrorCodes.INVALID_INPUT;
            case common_1.HttpStatus.UNAUTHORIZED:
                return error_codes_1.ErrorCodes.UNAUTHORIZED;
            case common_1.HttpStatus.FORBIDDEN:
                return error_codes_1.ErrorCodes.FORBIDDEN;
            case common_1.HttpStatus.NOT_FOUND:
                return error_codes_1.ErrorCodes.NOT_FOUND;
            default:
                return error_codes_1.ErrorCodes.INTERNAL_SERVER_ERROR;
        }
    }
    getStatusFromErrorCode(errorCode) {
        switch (errorCode) {
            case error_codes_1.ErrorCodes.INVALID_INPUT:
                return common_1.HttpStatus.BAD_REQUEST;
            case error_codes_1.ErrorCodes.UNAUTHORIZED:
                return common_1.HttpStatus.UNAUTHORIZED;
            case error_codes_1.ErrorCodes.FORBIDDEN:
                return common_1.HttpStatus.FORBIDDEN;
            case error_codes_1.ErrorCodes.NOT_FOUND:
                return common_1.HttpStatus.NOT_FOUND;
            default:
                return common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [audit_logging_service_1.AuditLoggingService,
        sentry_service_1.SentryService])
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map