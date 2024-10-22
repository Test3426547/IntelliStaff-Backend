/// <reference types="multer" />
import { ResumeIngestionService } from './resume-ingestion.service';
import { HealthCheckService } from '@nestjs/terminus';
export declare class ResumeIngestionController {
    private readonly resumeIngestionService;
    private health;
    constructor(resumeIngestionService: ResumeIngestionService, health: HealthCheckService);
    uploadResume(file: Express.Multer.File): Promise<string>;
    ingestResumeFromEmail(email: string): Promise<void>;
    getResumes(page?: number, limit?: number): Promise<{
        resumes: any[];
        total: number;
    }>;
    checkHealth(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
