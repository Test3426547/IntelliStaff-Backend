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
var JobRelistingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRelistingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const integration_service_1 = require("../integration/integration.service");
const schedule = __importStar(require("node-schedule"));
let JobRelistingService = JobRelistingService_1 = class JobRelistingService {
    constructor(configService, integrationService) {
        this.configService = configService;
        this.integrationService = integrationService;
        this.logger = new common_1.Logger(JobRelistingService_1.name);
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
        this.initializeScheduler();
    }
    initializeScheduler() {
        schedule.scheduleJob('0 0 * * *', () => {
            this.relistJobsDaily();
        });
    }
    async relistJob(jobId) {
        try {
            const job = await this.getJob(jobId);
            if (!job) {
                throw new Error(`Job with ID ${jobId} not found`);
            }
            if (await this.isDuplicate(job)) {
                this.logger.warn(`Job ${jobId} is a duplicate and will not be relisted`);
                return { status: 'skipped', reason: 'duplicate' };
            }
            const relistingResult = await this.integrationService.relistJobOnExternalPlatforms(job);
            await this.updateJobRelistingStatus(jobId, relistingResult);
            return relistingResult;
        }
        catch (error) {
            this.logger.error(`Error relisting job ${jobId}: ${error.message}`);
            throw error;
        }
    }
    async getJob(jobId) {
        const { data, error } = await this.supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single();
        if (error) {
            throw new Error(`Failed to fetch job: ${error.message}`);
        }
        return data;
    }
    async isDuplicate(job) {
        const { data, error } = await this.supabase
            .from('job_listings')
            .select('id')
            .eq('external_id', job.external_id)
            .eq('platform', job.platform)
            .not('status', 'eq', 'expired')
            .limit(1);
        if (error) {
            throw new Error(`Failed to check for duplicates: ${error.message}`);
        }
        return data.length > 0;
    }
    async updateJobRelistingStatus(jobId, relistingResult) {
        const { error } = await this.supabase
            .from('job_listings')
            .insert({
            job_id: jobId,
            platform: relistingResult.platform,
            external_id: relistingResult.externalId,
            status: relistingResult.status,
            relisted_at: new Date().toISOString(),
        });
        if (error) {
            throw new Error(`Failed to update job relisting status: ${error.message}`);
        }
    }
    async getJobRelistingStatus(jobId) {
        const { data, error } = await this.supabase
            .from('job_listings')
            .select('*')
            .eq('job_id', jobId)
            .order('relisted_at', { ascending: false });
        if (error) {
            throw new Error(`Failed to get job relisting status: ${error.message}`);
        }
        return data;
    }
    async relistJobsDaily() {
        try {
            const { data, error } = await this.supabase
                .from('jobs')
                .select('id')
                .eq('status', 'active')
                .order('last_relisted_at', { ascending: true })
                .limit(100);
            if (error) {
                throw new Error(`Failed to fetch jobs for relisting: ${error.message}`);
            }
            for (const job of data) {
                await this.relistJob(job.id);
                await this.updateLastRelistedAt(job.id);
            }
            this.logger.log(`Daily job relisting completed for ${data.length} jobs`);
        }
        catch (error) {
            this.logger.error(`Error in daily job relisting: ${error.message}`);
        }
    }
    async updateLastRelistedAt(jobId) {
        const { error } = await this.supabase
            .from('jobs')
            .update({ last_relisted_at: new Date().toISOString() })
            .eq('id', jobId);
        if (error) {
            throw new Error(`Failed to update last_relisted_at for job ${jobId}: ${error.message}`);
        }
    }
};
exports.JobRelistingService = JobRelistingService;
exports.JobRelistingService = JobRelistingService = JobRelistingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        integration_service_1.IntegrationService])
], JobRelistingService);
//# sourceMappingURL=job-relisting.service.js.map