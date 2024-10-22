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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const auth_guard_1 = require("../user-management/auth.guard");
const swagger_1 = require("@nestjs/swagger");
const terminus_1 = require("@nestjs/terminus");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService, health) {
        this.analyticsService = analyticsService;
        this.health = health;
    }
    async getJobPostingStats(timeRange = 'month') {
        return this.analyticsService.getJobPostingStats(timeRange);
    }
    async getApplicantStats(timeRange = 'month') {
        return this.analyticsService.getApplicantStats(timeRange);
    }
    async getMatchingInsights(timeRange = 'month') {
        return this.analyticsService.getMatchingInsights(timeRange);
    }
    async getRecruitmentFunnelAnalysis(timeRange = 'month') {
        return this.analyticsService.getRecruitmentFunnelAnalysis(timeRange);
    }
    async getMarketTrendsAnalysis() {
        return this.analyticsService.getMarketTrendsAnalysis();
    }
    async checkHealth() {
        return this.health.check([
            () => this.analyticsService.checkHealth(),
        ]);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('job-posting-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get job posting statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Job posting statistics retrieved successfully' }),
    __param(0, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getJobPostingStats", null);
__decorate([
    (0, common_1.Get)('applicant-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get applicant statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Applicant statistics retrieved successfully' }),
    __param(0, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getApplicantStats", null);
__decorate([
    (0, common_1.Get)('matching-insights'),
    (0, swagger_1.ApiOperation)({ summary: 'Get matching insights' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Matching insights retrieved successfully' }),
    __param(0, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getMatchingInsights", null);
__decorate([
    (0, common_1.Get)('recruitment-funnel'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recruitment funnel analysis' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recruitment funnel analysis retrieved successfully' }),
    __param(0, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getRecruitmentFunnelAnalysis", null);
__decorate([
    (0, common_1.Get)('market-trends'),
    (0, swagger_1.ApiOperation)({ summary: 'Get market trends analysis' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Market trends analysis retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getMarketTrendsAnalysis", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check the health of the Analytics service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "checkHealth", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('analytics'),
    (0, common_1.Controller)('analytics'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService,
        terminus_1.HealthCheckService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map