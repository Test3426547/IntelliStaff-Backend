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
var AuditLoggingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLoggingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const terminus_1 = require("@nestjs/terminus");
let AuditLoggingService = AuditLoggingService_1 = class AuditLoggingService extends terminus_1.HealthIndicator {
    constructor(configService) {
        super();
        this.configService = configService;
        this.logger = new common_1.Logger(AuditLoggingService_1.name);
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
    }
    async checkHealth() {
        try {
            const { data, error } = await this.supabase.from('audit_logs').select('id').limit(1);
            if (error)
                throw error;
            return this.getStatus('audit_logging_db', true, { message: 'Audit Logging DB is healthy' });
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error.message}`);
            throw new terminus_1.HealthCheckError('Audit Logging DB check failed', error);
        }
    }
    async logActivity(userId, action, details) {
        try {
            const { error } = await this.supabase.from('audit_logs').insert({
                user_id: userId,
                action,
                details,
                timestamp: new Date().toISOString(),
            });
            if (error)
                throw new Error(`Failed to log activity: ${error.message}`);
        }
        catch (error) {
            this.logger.error(`Error logging activity: ${error.message}`);
            throw error;
        }
    }
    async generateAuditTrail(startDate, endDate) {
        try {
            const { data, error } = await this.supabase
                .from('audit_logs')
                .select('*')
                .gte('timestamp', startDate.toISOString())
                .lte('timestamp', endDate.toISOString())
                .order('timestamp', { ascending: true });
            if (error)
                throw new Error(`Failed to generate audit trail: ${error.message}`);
            return data;
        }
        catch (error) {
            this.logger.error(`Error generating audit trail: ${error.message}`);
            throw error;
        }
    }
    async createAlert(type, message, severity) {
        try {
            const { error } = await this.supabase.from('alerts').insert({
                type,
                message,
                severity,
                timestamp: new Date().toISOString(),
                status: 'open',
            });
            if (error)
                throw new Error(`Failed to create alert: ${error.message}`);
            if (severity === 'high') {
                this.notifyAdmins(type, message);
            }
        }
        catch (error) {
            this.logger.error(`Error creating alert: ${error.message}`);
            throw error;
        }
    }
    async notifyAdmins(alertType, alertMessage) {
        this.logger.log(`Admin notification: Alert Type - ${alertType}, Message - ${alertMessage}`);
    }
};
exports.AuditLoggingService = AuditLoggingService;
exports.AuditLoggingService = AuditLoggingService = AuditLoggingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AuditLoggingService);
//# sourceMappingURL=audit-logging.service.js.map