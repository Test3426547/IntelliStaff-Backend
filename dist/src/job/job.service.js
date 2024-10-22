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
var JobService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const terminus_1 = require("@nestjs/terminus");
const common_utils_1 = require("../common/common-utils");
let JobService = JobService_1 = class JobService extends terminus_1.HealthIndicator {
    constructor(configService) {
        super();
        this.configService = configService;
        this.logger = new common_1.Logger(JobService_1.name);
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
    }
    async checkHealth() {
        try {
            const { data, error } = await this.supabase.from('jobs').select('id').limit(1);
            if (error)
                throw error;
            return this.getStatus('job_service_db', true, { message: 'Job Service DB is healthy' });
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error.message}`);
            throw new terminus_1.HealthCheckError('Job Service DB check failed', error);
        }
    }
    async retryOperation(operation, maxRetries = 3) {
        return common_utils_1.CommonUtils.retryOperation(operation, maxRetries);
    }
    async createJob(jobData) {
        return this.retryOperation(async () => {
            try {
                const { data, error } = await this.supabase.from('jobs').insert(jobData).single();
                if (error)
                    throw new Error(`Failed to create job: ${error.message}`);
                return data;
            }
            catch (error) {
                this.logger.error(`Error creating job: ${error.message}`);
                throw common_utils_1.CommonUtils.handleError(error);
            }
        });
    }
    async getJob(jobId) {
        return this.retryOperation(async () => {
            try {
                const { data, error } = await this.supabase.from('jobs').select('*').eq('id', jobId).single();
                if (error)
                    throw new Error(`Failed to get job: ${error.message}`);
                return data;
            }
            catch (error) {
                this.logger.error(`Error getting job: ${error.message}`);
                throw common_utils_1.CommonUtils.handleError(error);
            }
        });
    }
    async updateJob(jobId, jobData) {
        return this.retryOperation(async () => {
            try {
                const { data, error } = await this.supabase.from('jobs').update(jobData).eq('id', jobId).single();
                if (error)
                    throw new Error(`Failed to update job: ${error.message}`);
                return data;
            }
            catch (error) {
                this.logger.error(`Error updating job: ${error.message}`);
                throw common_utils_1.CommonUtils.handleError(error);
            }
        });
    }
    async deleteJob(jobId) {
        return this.retryOperation(async () => {
            try {
                const { error } = await this.supabase.from('jobs').delete().eq('id', jobId);
                if (error)
                    throw new Error(`Failed to delete job: ${error.message}`);
            }
            catch (error) {
                this.logger.error(`Error deleting job: ${error.message}`);
                throw common_utils_1.CommonUtils.handleError(error);
            }
        });
    }
    async listJobs(page = 1, limit = 10) {
        return this.retryOperation(async () => {
            try {
                const { data, error, count } = await this.supabase
                    .from('jobs')
                    .select('*', { count: 'exact' })
                    .range((page - 1) * limit, page * limit - 1);
                if (error)
                    throw new Error(`Failed to list jobs: ${error.message}`);
                return { jobs: data, total: count };
            }
            catch (error) {
                this.logger.error(`Error listing jobs: ${error.message}`);
                throw common_utils_1.CommonUtils.handleError(error);
            }
        });
    }
};
exports.JobService = JobService;
exports.JobService = JobService = JobService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], JobService);
//# sourceMappingURL=job.service.js.map