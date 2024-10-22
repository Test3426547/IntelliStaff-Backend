import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
export declare class JobService extends HealthIndicator {
    private configService;
    private supabase;
    private readonly logger;
    constructor(configService: ConfigService);
    checkHealth(): Promise<HealthIndicatorResult>;
    private retryOperation;
    createJob(jobData: any): Promise<any>;
    getJob(jobId: string): Promise<any>;
    updateJob(jobId: string, jobData: any): Promise<any>;
    deleteJob(jobId: string): Promise<void>;
    listJobs(page?: number, limit?: number): Promise<{
        jobs: any[];
        total: number;
    }>;
}
