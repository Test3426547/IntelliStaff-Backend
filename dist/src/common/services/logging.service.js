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
var LoggingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let LoggingService = LoggingService_1 = class LoggingService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(LoggingService_1.name);
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
    }
    log(message, context) {
        this.logger.log(message, context);
        this.saveLog('info', message, context);
    }
    error(message, trace, context) {
        this.logger.error(message, trace, context);
        this.saveLog('error', message, context, trace);
    }
    warn(message, context) {
        this.logger.warn(message, context);
        this.saveLog('warn', message, context);
    }
    debug(message, context) {
        this.logger.debug(message, context);
        this.saveLog('debug', message, context);
    }
    verbose(message, context) {
        this.logger.verbose(message, context);
        this.saveLog('verbose', message, context);
    }
    async saveLog(level, message, context, trace) {
        try {
            const { error } = await this.supabase.from('application_logs').insert({
                level,
                message,
                context,
                trace,
                timestamp: new Date().toISOString(),
            });
            if (error) {
                this.logger.error(`Failed to save log to Supabase: ${error.message}`);
            }
        }
        catch (error) {
            this.logger.error(`Error saving log to Supabase: ${error.message}`);
        }
    }
};
exports.LoggingService = LoggingService;
exports.LoggingService = LoggingService = LoggingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LoggingService);
//# sourceMappingURL=logging.service.js.map