import { ApplicantMatchingService } from './applicant-matching.service';
import { HealthCheckService } from '@nestjs/terminus';
export declare class ApplicantMatchingController {
    private readonly applicantMatchingService;
    private health;
    constructor(applicantMatchingService: ApplicantMatchingService, health: HealthCheckService);
    matchApplicantToJob(applicantId: string, jobId: string): Promise<any>;
    getMatchesForApplicant(applicantId: string): Promise<any[]>;
    getMatchesForJob(jobId: string): Promise<any[]>;
    removeMatch(matchId: string): Promise<{
        message: string;
    }>;
    generateMatchReport(matchId: string): Promise<string>;
    checkHealth(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
