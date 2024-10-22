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
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const job_processing_service_1 = require("./job-processing.service");
const { scrapeLinkedInJob, scrapeLinkedInJobs } = require('./linkedin-scraper');
let JobIngestionService = JobIngestionService_1 = class JobIngestionService {
    constructor(configService, jobProcessingService) {
        this.configService = configService;
        this.jobProcessingService = jobProcessingService;
        this.logger = new common_1.Logger(JobIngestionService_1.name);
        this.lastScrapeTime = 0;
        this.RATE_LIMIT_DELAY = 60000;
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
        this.logger.log('JobIngestionService initialized');
    }
    async enforceRateLimit() {
        const now = Date.now();
        const timeSinceLastScrape = now - this.lastScrapeTime;
        if (timeSinceLastScrape < this.RATE_LIMIT_DELAY) {
            const waitTime = this.RATE_LIMIT_DELAY - timeSinceLastScrape;
            this.logger.log(`Rate limiting: Waiting for ${waitTime}ms before next scrape`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        this.lastScrapeTime = Date.now();
    }
    async scrapeAndIngestLinkedInJobs(searchUrl, limit = 10) {
        this.logger.log(`Starting to scrape and ingest LinkedIn jobs from: ${searchUrl}`);
        this.logger.debug(`Scraping limit set to: ${limit} jobs`);
        try {
            await this.enforceRateLimit();
            this.logger.debug(`Attempting to scrape ${limit} jobs from LinkedIn`);
            const startTime = Date.now();
            const jobs = await scrapeLinkedInJobs(searchUrl, limit);
            const endTime = Date.now();
            this.logger.log(`Successfully scraped ${jobs.length} jobs from LinkedIn in ${endTime - startTime}ms`);
            const insertedJobs = [];
            for (const job of jobs) {
                try {
                    this.logger.debug(`Processing job: ${job.title} at ${job.company}`);
                    const { data, error } = await this.supabase
                        .from('jobs')
                        .insert({
                        title: job.title,
                        company: job.company,
                        location: job.location,
                        description: job.description,
                        posted_date: job.postedDate,
                        job_type: job.jobType,
                        applicants: job.applicants,
                        salary: job.salary,
                        skills: job.skills,
                        source_url: job.url,
                    })
                        .single();
                    if (error) {
                        this.logger.error(`Failed to insert job: ${error.message}`);
                        continue;
                    }
                    const insertedJob = data;
                    insertedJobs.push(insertedJob);
                    this.logger.debug(`Job inserted successfully. ID: ${insertedJob.id}`);
                    this.logger.debug(`Triggering job processing for job ID: ${insertedJob.id}`);
                    await this.jobProcessingService.processJob(insertedJob.id);
                    this.logger.debug(`Job processing completed for job ID: ${insertedJob.id}`);
                }
                catch (error) {
                    this.logger.error(`Error processing job: ${error.message}`);
                }
            }
            this.logScrapingStats(startTime, Date.now(), jobs.length, insertedJobs.length);
            return insertedJobs;
        }
        catch (error) {
            this.logger.error(`Error scraping and ingesting LinkedIn jobs: ${error.message}`);
            throw error;
        }
    }
    async getJobById(jobId) {
        this.logger.debug(`Fetching job with ID: ${jobId}`);
        try {
            const { data, error } = await this.supabase
                .from('jobs')
                .select('*')
                .eq('id', jobId)
                .single();
            if (error) {
                this.logger.error(`Failed to fetch job: ${error.message}`);
                return null;
            }
            this.logger.debug(`Successfully fetched job with ID: ${jobId}`);
            return data;
        }
        catch (error) {
            this.logger.error(`Error fetching job: ${error.message}`);
            return null;
        }
    }
    async listJobs(page = 1, limit = 10) {
        this.logger.debug(`Listing jobs: page ${page}, limit ${limit}`);
        try {
            const startTime = Date.now();
            const { data, error, count } = await this.supabase
                .from('jobs')
                .select('*', { count: 'exact' })
                .range((page - 1) * limit, page * limit - 1)
                .order('posted_date', { ascending: false });
            const endTime = Date.now();
            if (error) {
                this.logger.error(`Failed to list jobs: ${error.message}`);
                return { jobs: [], total: 0 };
            }
            this.logger.debug(`Successfully listed ${data.length} jobs. Total count: ${count}. Query time: ${endTime - startTime}ms`);
            return { jobs: data, total: count || 0 };
        }
        catch (error) {
            this.logger.error(`Error listing jobs: ${error.message}`);
            return { jobs: [], total: 0 };
        }
    }
    logScrapingStats(startTime, endTime, totalJobs, successfulJobs) {
        const duration = endTime - startTime;
        const successRate = (successfulJobs / totalJobs) * 100;
        this.logger.log(`Scraping Statistics:
      Total Duration: ${duration}ms
      Total Jobs Scraped: ${totalJobs}
      Successfully Inserted Jobs: ${successfulJobs}
      Success Rate: ${successRate.toFixed(2)}%
    `);
    }
};
exports.JobIngestionService = JobIngestionService;
exports.JobIngestionService = JobIngestionService = JobIngestionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        job_processing_service_1.JobProcessingService])
], JobIngestionService);
//# sourceMappingURL=job-ingestion.service.js.map