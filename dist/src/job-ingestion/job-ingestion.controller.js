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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobIngestionController = void 0;
const common_1 = require("@nestjs/common");
const job_ingestion_service_1 = require("./job-ingestion.service");
const swagger_1 = require("@nestjs/swagger");
let JobIngestionController = class JobIngestionController {
    constructor(jobIngestionService) {
        this.jobIngestionService = jobIngestionService;
    }
    async ingestJobs(url, batchSize = 10, maxJobs = 100) {
        await this.jobIngestionService.ingestJobs(url, batchSize, maxJobs);
        return { message: 'Jobs ingested successfully' };
    }
    async getJobs() {
        return this.jobIngestionService.getJobs();
    }
};
exports.JobIngestionController = JobIngestionController;
__decorate([
    (0, common_1.Post)('ingest'),
    (0, swagger_1.ApiOperation)({ summary: 'Ingest jobs from a given URL' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Jobs ingested successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'url', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'batchSize', required: false, type: Number, description: 'Number of jobs to process in each batch' }),
    (0, swagger_1.ApiQuery)({ name: 'maxJobs', required: false, type: Number, description: 'Maximum number of jobs to scrape' }),
    __param(0, (0, common_1.Query)('url')),
    __param(1, (0, common_1.Query)('batchSize')),
    __param(2, (0, common_1.Query)('maxJobs')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], JobIngestionController.prototype, "ingestJobs", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all ingested jobs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return all jobs', type: [job_interface_1.Job] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobIngestionController.prototype, "getJobs", null);
exports.JobIngestionController = JobIngestionController = __decorate([
    (0, swagger_1.ApiTags)('job-ingestion'),
    (0, common_1.Controller)('job-ingestion'),
    __metadata("design:paramtypes", [job_ingestion_service_1.JobIngestionService])
], JobIngestionController);
//# sourceMappingURL=job-ingestion.controller.js.map