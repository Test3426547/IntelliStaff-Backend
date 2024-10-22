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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const audit_logging_service_1 = require("../../audit-logging/audit-logging.service");
const event_emitter_1 = require("../events/event.emitter");
let HttpExceptionFilter = class HttpExceptionFilter {
    constructor(auditLoggingService, eventEmitter) {
        this.auditLoggingService = auditLoggingService;
        this.eventEmitter = eventEmitter;
    }
    async catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof common_1.HttpException
            ? exception.message
            : 'Internal server error';
        const errorResponse = {
            statusCode: status,
            message: message,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            errorDetails: exception instanceof Error ? exception.stack : undefined,
        };
        await this.auditLoggingService.logAction('system', 'error', errorResponse);
        this.eventEmitter.emit('error', errorResponse);
        delete errorResponse.errorDetails;
        response.status(status).json(errorResponse);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [audit_logging_service_1.AuditLoggingService,
        event_emitter_1.EventEmitterService])
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map