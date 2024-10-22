import { AnalyticsService } from './analytics.service';
import { HealthCheckService } from '@nestjs/terminus';
export declare class AnalyticsController {
    private readonly analyticsService;
    private health;
    constructor(analyticsService: AnalyticsService, health: HealthCheckService);
    getJobPostingStats(timeRange?: string): Promise<any>;
    getApplicantStats(timeRange?: string): Promise<any>;
    getMatchingInsights(timeRange?: string): Promise<any>;
    getRecruitmentFunnelAnalysis(timeRange?: string): Promise<any>;
    getMarketTrendsAnalysis(): Promise<any>;
    checkHealth(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
