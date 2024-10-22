import { ResumeProcessingService } from './resume-processing.service';
import { HealthCheckService } from '@nestjs/terminus';
export declare class ResumeProcessingController {
    private readonly resumeProcessingService;
    private health;
    constructor(resumeProcessingService: ResumeProcessingService, health: HealthCheckService);
    processResume(id: string): Promise<any>;
    getPersonalizedFeedback(id: string): Promise<string>;
    checkHealth(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
