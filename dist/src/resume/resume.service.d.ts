import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
export declare class ResumeService extends HealthIndicator {
    private configService;
    private supabase;
    private readonly logger;
    constructor(configService: ConfigService);
    checkHealth(): Promise<HealthIndicatorResult>;
    private retryOperation;
    createResume(resumeData: any): Promise<any>;
    getResume(resumeId: string): Promise<any>;
    updateResume(resumeId: string, resumeData: any): Promise<any>;
    deleteResume(resumeId: string): Promise<void>;
    listResumes(page?: number, limit?: number): Promise<{
        resumes: any[];
        total: number;
    }>;
}
