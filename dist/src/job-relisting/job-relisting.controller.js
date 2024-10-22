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
exports.JobRelistingController = void 0;
const common_1 = require("@nestjs/common");
const job_relisting_service_1 = require("./job-relisting.service");
const swagger_1 = require("@nestjs/swagger");
let JobRelistingController = class JobRelistingController {
    constructor(jobRelistingService) {
        this.jobRelistingService = jobRelistingService;
    }
    async relistJob(jobId) {
        return this.jobRelistingService.relistJob(jobId);
    }
    async getRelistedJobs(page = 1, pageSize = 10) {
        return this.jobRelistingService.getRelistedJobs(page, pageSize);
    }
};
exports.JobRelistingController = JobRelistingController;
__decorate([
    (0, common_1.Post)('relist'),
    (0, swagger_1.ApiOperation)({ summary: 'Relist a job on external platforms' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Job added to relisting queue successfully', type: job_interface_1.Job }),
    __param(0, (0, common_1.Body)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobRelistingController.prototype, "relistJob", null);
__decorate([
    (0, common_1.Get)('relisted'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all relisted jobs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return all relisted jobs', type: [job_interface_1.Job] }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, type: Number }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], JobRelistingController.prototype, "getRelistedJobs", null);
exports.JobRelistingController = JobRelistingController = __decorate([
    (0, swagger_1.ApiTags)('job-relisting'),
    (0, common_1.Controller)('job-relisting'),
    __metadata("design:paramtypes", [job_relisting_service_1.JobRelistingService])
], JobRelistingController);
//# sourceMappingURL=job-relisting.controller.js.map