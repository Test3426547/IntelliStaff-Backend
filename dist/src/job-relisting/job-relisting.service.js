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
var JobRelistingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRelistingService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("@nestjs/config");
const platform_integration_service_1 = require("./platform-integration.service");
let JobRelistingService = JobRelistingService_1 = class JobRelistingService {
    constructor(configService, platformIntegrationService) {
        this.configService = configService;
        this.platformIntegrationService = platformIntegrationService;
        this.logger = new common_1.Logger(JobRelistingService_1.name);
        this.relistingQueue = [];
        this.isProcessing = false;
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
    }
    async relistJob(jobId) {
        const { data: job, error } = await this.supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single();
        if (error)
            throw new Error(`Failed to fetch job: ${error.message}`);
        if (await this.isDuplicate(job)) {
            throw new Error('This job is already listed on external platforms');
        }
        this.relistingQueue.push(jobId);
        this.processQueue();
        return job;
    }
    async processQueue() {
        if (this.isProcessing || this.relistingQueue.length === 0)
            return;
        this.isProcessing = true;
        const jobId = this.relistingQueue.shift();
        try {
            const { data: job, error } = await this.supabase
                .from('jobs')
                .select('*')
                .eq('id', jobId)
                .single();
            if (error)
                throw new Error(`Failed to fetch job: ${error.message}`);
            const relistedJob = await this.platformIntegrationService.relistJob(job);
            const { data: updatedJob, error: updateError } = await this.supabase
                .from('jobs')
                .update(Object.assign(Object.assign({}, relistedJob), { lastRelistedDate: new Date() }))
                .eq('id', jobId)
                .single();
            if (updateError)
                throw new Error(`Failed to update job: ${updateError.message}`);
            this.logger.log(`Job ${jobId} relisted successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to relist job ${jobId}: ${error.message}`);
        }
        finally {
            this.isProcessing = false;
            this.processQueue();
        }
    }
    async getRelistedJobs(page = 1, pageSize = 10) {
        const startIndex = (page - 1) * pageSize;
        const { data, error, count } = await this.supabase
            .from('jobs')
            .select('*', { count: 'exact' })
            .not('lastRelistedDate', 'is', null)
            .range(startIndex, startIndex + pageSize - 1)
            .order('lastRelistedDate', { ascending: false });
        if (error)
            throw new Error(`Failed to fetch relisted jobs: ${error.message}`);
        return { jobs: data, totalCount: count };
    }
    async isDuplicate(job) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { data, error } = await this.supabase
            .from('jobs')
            .select('id')
            .eq('title', job.title)
            .eq('company', job.company)
            .gte('lastRelistedDate', thirtyDaysAgo.toISOString())
            .not('id', 'eq', job.id)
            .limit(1);
        if (error)
            throw new Error(`Failed to check for duplicates: ${error.message}`);
        return data.length > 0;
    }
};
exports.JobRelistingService = JobRelistingService;
exports.JobRelistingService = JobRelistingService = JobRelistingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        platform_integration_service_1.PlatformIntegrationService])
], JobRelistingService);
//# sourceMappingURL=job-relisting.service.js.map