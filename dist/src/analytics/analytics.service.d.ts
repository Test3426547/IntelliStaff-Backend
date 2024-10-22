import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
export declare class AnalyticsService extends HealthIndicator {
    private configService;
    private supabase;
    private readonly logger;
    private cache;
    private huggingfaceApiKey;
    private huggingfaceInferenceEndpoint;
    constructor(configService: ConfigService);
    checkHealth(): Promise<HealthIndicatorResult>;
    getJobPostingStats(timeRange: string): Promise<any>;
    getApplicantStats(timeRange: string): Promise<any>;
    getMatchingInsights(timeRange: string): Promise<any>;
    getRecruitmentFunnelAnalysis(timeRange: string): Promise<any>;
    getMarketTrendsAnalysis(): Promise<any>;
    private getDateFromTimeRange;
    private calculateAverageSalary;
    private getTopCategories;
    private calculateAverageExperience;
    private getTopSkills;
    private getEducationDistribution;
    private calculateAverageMatchScore;
    private getTopMatchingJobs;
    private performSkillGapAnalysis;
}
