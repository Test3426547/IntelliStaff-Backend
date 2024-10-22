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
exports.ApplicantMatchingController = void 0;
const common_1 = require("@nestjs/common");
const applicant_matching_service_1 = require("./applicant-matching.service");
const auth_guard_1 = require("../user-management/auth.guard");
const swagger_1 = require("@nestjs/swagger");
const terminus_1 = require("@nestjs/terminus");
let ApplicantMatchingController = class ApplicantMatchingController {
    constructor(applicantMatchingService, health) {
        this.applicantMatchingService = applicantMatchingService;
        this.health = health;
    }
    async matchApplicantToJob(applicantId, jobId) {
        return this.applicantMatchingService.matchApplicantToJob(applicantId, jobId);
    }
    async getMatchesForApplicant(applicantId) {
        return this.applicantMatchingService.getMatchesForApplicant(applicantId);
    }
    async getMatchesForJob(jobId) {
        return this.applicantMatchingService.getMatchesForJob(jobId);
    }
    async removeMatch(matchId) {
        await this.applicantMatchingService.removeMatch(matchId);
        return { message: 'Match removed successfully' };
    }
    async generateMatchReport(matchId) {
        return this.applicantMatchingService.generateMatchReport(matchId);
    }
    async checkHealth() {
        return this.health.check([
            () => this.applicantMatchingService.checkHealth(),
        ]);
    }
};
exports.ApplicantMatchingController = ApplicantMatchingController;
__decorate([
    (0, common_1.Post)('match'),
    (0, swagger_1.ApiOperation)({ summary: 'Match an applicant to a job' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Match created successfully' }),
    __param(0, (0, common_1.Body)('applicantId')),
    __param(1, (0, common_1.Body)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ApplicantMatchingController.prototype, "matchApplicantToJob", null);
__decorate([
    (0, common_1.Get)('applicant/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get matches for an applicant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Matches retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplicantMatchingController.prototype, "getMatchesForApplicant", null);
__decorate([
    (0, common_1.Get)('job/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get matches for a job' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Matches retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplicantMatchingController.prototype, "getMatchesForJob", null);
__decorate([
    (0, common_1.Delete)('match/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a match' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Match removed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplicantMatchingController.prototype, "removeMatch", null);
__decorate([
    (0, common_1.Get)('match/:id/report'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a detailed match report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Match report generated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApplicantMatchingController.prototype, "generateMatchReport", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check the health of the ApplicantMatching service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApplicantMatchingController.prototype, "checkHealth", null);
exports.ApplicantMatchingController = ApplicantMatchingController = __decorate([
    (0, swagger_1.ApiTags)('applicant-matching'),
    (0, common_1.Controller)('applicant-matching'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [applicant_matching_service_1.ApplicantMatchingService,
        terminus_1.HealthCheckService])
], ApplicantMatchingController);
//# sourceMappingURL=applicant-matching.controller.js.map