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
exports.JobProcessingController = void 0;
const common_1 = require("@nestjs/common");
const job_processing_service_1 = require("./job-processing.service");
const swagger_1 = require("@nestjs/swagger");
let JobProcessingController = class JobProcessingController {
    constructor(jobProcessingService) {
        this.jobProcessingService = jobProcessingService;
    }
    async optimizeJob(jobId) {
        return this.jobProcessingService.optimizeJob(jobId);
    }
    async getOptimizedJobs() {
        return this.jobProcessingService.getOptimizedJobs();
    }
    async processJobs(jobIds) {
        await this.jobProcessingService.processJobs(jobIds);
        return;
    }
};
exports.JobProcessingController = JobProcessingController;
__decorate([
    (0, common_1.Post)('optimize/:jobId'),
    (0, swagger_1.ApiOperation)({ summary: 'Optimize a job posting' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Job optimized successfully', type: job_interface_1.Job }),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobProcessingController.prototype, "optimizeJob", null);
__decorate([
    (0, common_1.Get)('optimized'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all optimized jobs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return all optimized jobs', type: [job_interface_1.Job] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobProcessingController.prototype, "getOptimizedJobs", null);
__decorate([
    (0, common_1.Post)('process'),
    (0, swagger_1.ApiOperation)({ summary: 'Process multiple jobs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Jobs processed successfully' }),
    __param(0, (0, common_1.Body)('jobIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], JobProcessingController.prototype, "processJobs", null);
exports.JobProcessingController = JobProcessingController = __decorate([
    (0, swagger_1.ApiTags)('job-processing'),
    (0, common_1.Controller)('job-processing'),
    __metadata("design:paramtypes", [job_processing_service_1.JobProcessingService])
], JobProcessingController);
//# sourceMappingURL=job-processing.controller.js.map