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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var JobIngestionController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobIngestionController = void 0;
const common_1 = require("@nestjs/common");
const job_ingestion_service_1 = require("./job-ingestion.service");
const auth_guard_1 = require("../user-management/auth.guard");
const swagger_1 = require("@nestjs/swagger");
let JobIngestionController = JobIngestionController_1 = class JobIngestionController {
    constructor(jobIngestionService) {
        this.jobIngestionService = jobIngestionService;
        this.logger = new common_1.Logger(JobIngestionController_1.name);
    }
    async scrapeAndIngestLinkedInJobs(data) {
        this.logger.log(`Received request to scrape LinkedIn jobs. URL: ${data.searchUrl}, Limit: ${data.limit || 'default'}`);
        try {
            if (!data.searchUrl) {
                throw new common_1.HttpException('Search URL is required', common_1.HttpStatus.BAD_REQUEST);
            }
            const startTime = Date.now();
            const jobs = await this.jobIngestionService.scrapeAndIngestLinkedInJobs(data.searchUrl, data.limit);
            const endTime = Date.now();
            const duration = endTime - startTime;
            this.logger.log(`Successfully scraped and ingested ${jobs.length} LinkedIn jobs in ${duration}ms`);
            return {
                message: `${jobs.length} jobs scraped and ingested successfully`,
                jobs,
                statistics: {
                    totalJobs: jobs.length,
                    duration: duration,
                    averageTimePerJob: jobs.length > 0 ? duration / jobs.length : 0
                }
            };
        }
        catch (error) {
            this.logger.error(`Error in scrapeAndIngestLinkedInJobs: ${error.message}`);
            throw new common_1.HttpException('Failed to scrape and ingest LinkedIn jobs', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getJob(id) {
        this.logger.log(`Received request to get job with ID: ${id}`);
        try {
            const job = await this.jobIngestionService.getJobById(id);
            if (job) {
                this.logger.log(`Successfully retrieved job with ID: ${id}`);
                return job;
            }
            else {
                this.logger.warn(`Job with ID ${id} not found`);
                throw new common_1.HttpException('Job not found', common_1.HttpStatus.NOT_FOUND);
            }
        }
        catch (error) {
            this.logger.error(`Error in getJob: ${error.message}`);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to retrieve job', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async listJobs(page = 1, limit = 10) {
        this.logger.log(`Received request to list jobs. Page: ${page}, Limit: ${limit}`);
        try {
            const startTime = Date.now();
            const { jobs, total } = await this.jobIngestionService.listJobs(page, limit);
            const endTime = Date.now();
            const duration = endTime - startTime;
            this.logger.log(`Successfully listed ${jobs.length} jobs. Total: ${total}. Query time: ${duration}ms`);
            return {
                jobs,
                total,
                page,
                limit,
                queryTime: duration
            };
        }
        catch (error) {
            this.logger.error(`Error in listJobs: ${error.message}`);
            throw new common_1.HttpException('Failed to list jobs', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.JobIngestionController = JobIngestionController;
__decorate([
    (0, common_1.Post)('linkedin-jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'Scrape and ingest LinkedIn jobs' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Jobs scraped and ingested successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JobIngestionController.prototype, "scrapeAndIngestLinkedInJobs", null);
__decorate([
    (0, common_1.Get)('job'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a job by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Job retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Job not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobIngestionController.prototype, "getJob", null);
__decorate([
    (0, common_1.Get)('jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'List jobs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Jobs listed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], JobIngestionController.prototype, "listJobs", null);
exports.JobIngestionController = JobIngestionController = JobIngestionController_1 = __decorate([
    (0, swagger_1.ApiTags)('job-ingestion'),
    (0, common_1.Controller)('job-ingestion'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [job_ingestion_service_1.JobIngestionService])
], JobIngestionController);
//# sourceMappingURL=job-ingestion.controller.js.map