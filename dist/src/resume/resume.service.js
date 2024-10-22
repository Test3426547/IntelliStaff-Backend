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
var ResumeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const terminus_1 = require("@nestjs/terminus");
const operators_1 = require("rxjs/operators");
const rxjs_1 = require("rxjs");
let ResumeService = ResumeService_1 = class ResumeService extends terminus_1.HealthIndicator {
    constructor(configService) {
        super();
        this.configService = configService;
        this.logger = new common_1.Logger(ResumeService_1.name);
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
    }
    async checkHealth() {
        try {
            const { data, error } = await this.supabase.from('resumes').select('id').limit(1);
            if (error)
                throw error;
            return this.getStatus('resume_service_db', true, { message: 'Resume Service DB is healthy' });
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error.message}`);
            throw new terminus_1.HealthCheckError('Resume Service DB check failed', error);
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
    async createResume(resumeData) {
        return this.retryOperation(async () => {
            try {
                const { data, error } = await this.supabase.from('resumes').insert(resumeData).single();
                if (error)
                    throw new Error(`Failed to create resume: ${error.message}`);
                return data;
            }
            catch (error) {
                this.logger.error(`Error creating resume: ${error.message}`);
                throw new common_1.InternalServerErrorException('Failed to create resume');
            }
        });
    }
    async getResume(resumeId) {
        return this.retryOperation(async () => {
            try {
                const { data, error } = await this.supabase.from('resumes').select('*').eq('id', resumeId).single();
                if (error)
                    throw new Error(`Failed to get resume: ${error.message}`);
                return data;
            }
            catch (error) {
                this.logger.error(`Error getting resume: ${error.message}`);
                throw new common_1.InternalServerErrorException('Failed to get resume');
            }
        });
    }
    async updateResume(resumeId, resumeData) {
        return this.retryOperation(async () => {
            try {
                const { data, error } = await this.supabase.from('resumes').update(resumeData).eq('id', resumeId).single();
                if (error)
                    throw new Error(`Failed to update resume: ${error.message}`);
                return data;
            }
            catch (error) {
                this.logger.error(`Error updating resume: ${error.message}`);
                throw new common_1.InternalServerErrorException('Failed to update resume');
            }
        });
    }
    async deleteResume(resumeId) {
        return this.retryOperation(async () => {
            try {
                const { error } = await this.supabase.from('resumes').delete().eq('id', resumeId);
                if (error)
                    throw new Error(`Failed to delete resume: ${error.message}`);
            }
            catch (error) {
                this.logger.error(`Error deleting resume: ${error.message}`);
                throw new common_1.InternalServerErrorException('Failed to delete resume');
            }
        });
    }
    async listResumes(page = 1, limit = 10) {
        return this.retryOperation(async () => {
            try {
                const { data, error, count } = await this.supabase
                    .from('resumes')
                    .select('*', { count: 'exact' })
                    .range((page - 1) * limit, page * limit - 1);
                if (error)
                    throw new Error(`Failed to list resumes: ${error.message}`);
                return { resumes: data, total: count };
            }
            catch (error) {
                this.logger.error(`Error listing resumes: ${error.message}`);
                throw new common_1.InternalServerErrorException('Failed to list resumes');
            }
        });
    }
};
exports.ResumeService = ResumeService;
exports.ResumeService = ResumeService = ResumeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ResumeService);
//# sourceMappingURL=resume.service.js.map