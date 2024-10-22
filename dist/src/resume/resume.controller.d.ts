import { ResumeService } from './resume.service';
import { HealthCheckService } from '@nestjs/terminus';
export declare class ResumeController {
    private readonly resumeService;
    private health;
    constructor(resumeService: ResumeService, health: HealthCheckService);
    createResume(resumeData: any): Promise<any>;
    getResume(id: string): Promise<any>;
    updateResume(id: string, resumeData: any): Promise<any>;
    deleteResume(id: string): Promise<{
        message: string;
    }>;
    listResumes(page?: number, limit?: number): Promise<{
        resumes: any[];
        total: number;
    }>;
    checkHealth(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
