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
var JobIngestionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobIngestionService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("@nestjs/config");
const web_scraper_service_1 = require("./web-scraper.service");
const job_processing_service_1 = require("../job-processing/job-processing.service");
let JobIngestionService = JobIngestionService_1 = class JobIngestionService {
    constructor(configService, webScraperService, jobProcessingService) {
        this.configService = configService;
        this.webScraperService = webScraperService;
        this.jobProcessingService = jobProcessingService;
        this.logger = new common_1.Logger(JobIngestionService_1.name);
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
    }
    async ingestJobs(url, batchSize = 10, maxJobs = 100) {
        try {
            this.logger.log(`Starting job ingestion from ${url}`);
            const scrapedData = await this.webScraperService.scrapeJobs(url, maxJobs);
            this.logger.log(`Scraped ${scrapedData.length} jobs from ${url}`);
            const normalizedJobs = this.normalizeJobData(scrapedData);
            this.logger.log(`Normalized ${normalizedJobs.length} jobs`);
            const savedJobs = await this.saveJobsInBatches(normalizedJobs, batchSize);
            this.logger.log(`Saved ${savedJobs} unique jobs to the database`);
            this.logger.log(`Job ingestion completed successfully`);
        }
        catch (error) {
            this.logger.error(`Error during job ingestion: ${error.message}`, error.stack);
            throw new Error(`Job ingestion failed: ${error.message}`);
        }
    }
    normalizeJobData(scrapedData) {
        return scrapedData.map((job) => {
            var _a, _b, _c, _d, _e;
            return ({
                title: ((_a = job.title) === null || _a === void 0 ? void 0 : _a.trim()) || 'Unknown Title',
                company: ((_b = job.company) === null || _b === void 0 ? void 0 : _b.trim()) || 'Unknown Company',
                description: ((_c = job.description) === null || _c === void 0 ? void 0 : _c.trim()) || '',
                requirements: Array.isArray(job.requirements) ? job.requirements.filter(Boolean).map(req => req.trim()) : [],
                location: ((_d = job.location) === null || _d === void 0 ? void 0 : _d.trim()) || 'Unknown Location',
                salary: ((_e = job.salary) === null || _e === void 0 ? void 0 : _e.trim()) || null,
                postedDate: job.postedDate ? new Date(job.postedDate) : new Date(),
                source: 'web_scraping',
            });
        });
    }
    async saveJobsInBatches(jobs, batchSize) {
        let savedJobs = 0;
        for (let i = 0; i < jobs.length; i += batchSize) {
            const batch = jobs.slice(i, i + batchSize);
            const savedBatchJobs = await this.saveUniqueJobsToDatabase(batch);
            savedJobs += savedBatchJobs;
            await this.delay(1000);
        }
        return savedJobs;
    }
    async saveUniqueJobsToDatabase(jobs) {
        let savedJobs = 0;
        const savedJobIds = [];
        for (const job of jobs) {
            try {
                if (await this.isJobUnique(job)) {
                    const { data, error } = await this.supabase.from('jobs').insert(job).select();
                    if (error) {
                        this.logger.error(`Failed to save job: ${error.message}`);
                    }
                    else {
                        this.logger.log(`Job saved successfully: ${job.title} at ${job.company}`);
                        savedJobs++;
                        savedJobIds.push(data[0].id);
                    }
                }
                else {
                    this.logger.log(`Duplicate job found, skipping: ${job.title} at ${job.company}`);
                }
            }
            catch (error) {
                this.logger.error(`Error while saving job: ${error.message}`, error.stack);
            }
        }
        if (savedJobIds.length > 0) {
            await this.triggerJobProcessing(savedJobIds);
        }
        return savedJobs;
    }
    async isJobUnique(job) {
        try {
            const { data, error } = await this.supabase
                .from('jobs')
                .select('id')
                .eq('title', job.title)
                .eq('company', job.company)
                .eq('location', job.location)
                .single();
            if (error && error.code !== 'PGRST116') {
                this.logger.error(`Error checking for unique job: ${error.message}`);
                return false;
            }
            return !data;
        }
        catch (error) {
            this.logger.error(`Error checking job uniqueness: ${error.message}`, error.stack);
            return false;
        }
    }
    async triggerJobProcessing(jobIds) {
        try {
            await this.jobProcessingService.processJobs(jobIds);
            this.logger.log(`Triggered processing for ${jobIds.length} jobs`);
        }
        catch (error) {
            this.logger.error(`Failed to trigger job processing: ${error.message}`, error.stack);
        }
    }
    async getJobs() {
        try {
            const { data, error } = await this.supabase.from('jobs').select('*');
            if (error)
                throw new Error(`Failed to fetch jobs: ${error.message}`);
            return data;
        }
        catch (error) {
            this.logger.error(`Error fetching jobs: ${error.message}`, error.stack);
            throw new Error(`Failed to fetch jobs: ${error.message}`);
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
exports.JobIngestionService = JobIngestionService;
exports.JobIngestionService = JobIngestionService = JobIngestionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        web_scraper_service_1.WebScraperService,
        job_processing_service_1.JobProcessingService])
], JobIngestionService);
//# sourceMappingURL=job-ingestion.service.js.map