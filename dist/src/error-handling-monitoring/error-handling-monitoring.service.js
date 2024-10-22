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
var ErrorHandlingMonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandlingMonitoringService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Sentry = __importStar(require("@sentry/node"));
const terminus_1 = require("@nestjs/terminus");
const supabase_js_1 = require("@supabase/supabase-js");
let ErrorHandlingMonitoringService = ErrorHandlingMonitoringService_1 = class ErrorHandlingMonitoringService extends terminus_1.HealthIndicator {
    constructor(configService) {
        super();
        this.configService = configService;
        this.logger = new common_1.Logger(ErrorHandlingMonitoringService_1.name);
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
    }
    onModuleInit() {
        Sentry.init({
            dsn: this.configService.get('SENTRY_DSN'),
            environment: this.configService.get('NODE_ENV') || 'development',
        });
    }
    async checkHealth() {
        try {
            const { data, error } = await this.supabase.from('error_logs').select('id').limit(1);
            if (error)
                throw error;
            return this.getStatus('error_handling_monitoring_db', true, { message: 'Error Handling and Monitoring DB is healthy' });
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error.message}`);
            throw new terminus_1.HealthCheckError('Error Handling and Monitoring DB check failed', error);
        }
    }
    captureException(error, context) {
        Sentry.captureException(error, { extra: context });
        this.logError(error, context);
    }
    captureMessage(message, level = Sentry.Severity.Info, context) {
        Sentry.captureMessage(message, level);
        this.logMessage(message, level, context);
    }
    async getErrorLogs(page = 1, limit = 10) {
        try {
            const { data, error, count } = await this.supabase
                .from('error_logs')
                .select('*', { count: 'exact' })
                .order('timestamp', { ascending: false })
                .range((page - 1) * limit, page * limit - 1);
            if (error)
                throw new Error(`Failed to fetch error logs: ${error.message}`);
            return { logs: data, total: count };
        }
        catch (error) {
            this.logger.error(`Error fetching error logs: ${error.message}`);
            throw error;
        }
    }
    async getPerformanceMetrics(startDate, endDate) {
        try {
            const { data, error } = await this.supabase
                .from('performance_metrics')
                .select('*')
                .gte('timestamp', startDate.toISOString())
                .lte('timestamp', endDate.toISOString())
                .order('timestamp', { ascending: true });
            if (error)
                throw new Error(`Failed to fetch performance metrics: ${error.message}`);
            return data;
        }
        catch (error) {
            this.logger.error(`Error fetching performance metrics: ${error.message}`);
            throw error;
        }
    }
    async recordPerformanceMetric(metricName, value) {
        try {
            const { error } = await this.supabase
                .from('performance_metrics')
                .insert({
                metric_name: metricName,
                value,
                timestamp: new Date().toISOString(),
            });
            if (error)
                throw new Error(`Failed to record performance metric: ${error.message}`);
        }
        catch (error) {
            this.logger.error(`Error recording performance metric: ${error.message}`);
            throw error;
        }
    }
    async logError(error, context) {
        try {
            const { error: dbError } = await this.supabase
                .from('error_logs')
                .insert({
                message: error.message,
                stack: error.stack,
                context: JSON.stringify(context),
                timestamp: new Date().toISOString(),
            });
            if (dbError)
                throw new Error(`Failed to log error: ${dbError.message}`);
        }
        catch (logError) {
            this.logger.error(`Error logging to database: ${logError.message}`);
        }
    }
    async logMessage(message, level, context) {
        try {
            const { error: dbError } = await this.supabase
                .from('message_logs')
                .insert({
                message,
                level: level.toString(),
                context: JSON.stringify(context),
                timestamp: new Date().toISOString(),
            });
            if (dbError)
                throw new Error(`Failed to log message: ${dbError.message}`);
        }
        catch (logError) {
            this.logger.error(`Error logging message to database: ${logError.message}`);
        }
    }
};
exports.ErrorHandlingMonitoringService = ErrorHandlingMonitoringService;
exports.ErrorHandlingMonitoringService = ErrorHandlingMonitoringService = ErrorHandlingMonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ErrorHandlingMonitoringService);
//# sourceMappingURL=error-handling-monitoring.service.js.map