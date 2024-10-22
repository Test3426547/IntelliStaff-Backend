import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
export declare class ApplicantMatchingService extends HealthIndicator {
    private configService;
    private supabase;
    private readonly logger;
    private huggingfaceApiKey;
    private huggingfaceInferenceEndpoint;
    constructor(configService: ConfigService);
    checkHealth(): Promise<HealthIndicatorResult>;
    private retryOperation;
    matchApplicantToJob(applicantId: string, jobId: string): Promise<any>;
    getMatchesForApplicant(applicantId: string): Promise<any[]>;
    getMatchesForJob(jobId: string): Promise<any[]>;
    removeMatch(matchId: string): Promise<void>;
    private getApplicant;
    private getJob;
    private calculateMatchScore;
    private calculateSkillMatch;
    private calculateExperienceMatch;
    generateMatchReport(matchId: string): Promise<string>;
}
