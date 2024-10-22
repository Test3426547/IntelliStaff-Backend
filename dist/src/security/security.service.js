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
var SecurityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const terminus_1 = require("@nestjs/terminus");
const crypto = __importStar(require("crypto"));
let SecurityService = SecurityService_1 = class SecurityService extends terminus_1.HealthIndicator {
    constructor(configService) {
        super();
        this.configService = configService;
        this.logger = new common_1.Logger(SecurityService_1.name);
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
    }
    async checkHealth() {
        try {
            const { data, error } = await this.supabase.from('security_logs').select('id').limit(1);
            if (error)
                throw error;
            return this.getStatus('security_service_db', true, { message: 'Security Service DB is healthy' });
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error.message}`);
            throw new terminus_1.HealthCheckError('Security Service DB check failed', error);
        }
    }
    encrypt(text, key) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }
    decrypt(text, key) {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
    async createSecurityPolicy(policy) {
        try {
            const { error } = await this.supabase.from('security_policies').insert(policy);
            if (error)
                throw new Error(`Failed to create security policy: ${error.message}`);
        }
        catch (error) {
            this.logger.error(`Error creating security policy: ${error.message}`);
            throw error;
        }
    }
    async getSecurityPolicies() {
        try {
            const { data, error } = await this.supabase.from('security_policies').select('*');
            if (error)
                throw new Error(`Failed to fetch security policies: ${error.message}`);
            return data;
        }
        catch (error) {
            this.logger.error(`Error fetching security policies: ${error.message}`);
            throw error;
        }
    }
    async detectThreats(data) {
        const threats = [];
        if (data.includes('malicious')) {
            threats.push('Potential malicious content detected');
        }
        if (data.includes('sql injection')) {
            threats.push('Potential SQL injection attempt detected');
        }
        return threats;
    }
    async logSecurityEvent(event) {
        try {
            const { error } = await this.supabase.from('security_logs').insert(event);
            if (error)
                throw new Error(`Failed to log security event: ${error.message}`);
        }
        catch (error) {
            this.logger.error(`Error logging security event: ${error.message}`);
            throw error;
        }
    }
};
exports.SecurityService = SecurityService;
exports.SecurityService = SecurityService = SecurityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SecurityService);
//# sourceMappingURL=security.service.js.map