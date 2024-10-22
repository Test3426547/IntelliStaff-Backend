import { ConfigService } from '@nestjs/config';
import { PlatformIntegrationService } from './platform-integration.service';
import { Job } from '../common/interfaces/job.interface';
export declare class JobRelistingService {
    private configService;
    private platformIntegrationService;
    private supabase;
    private readonly logger;
    private relistingQueue;
    private isProcessing;
    constructor(configService: ConfigService, platformIntegrationService: PlatformIntegrationService);
    relistJob(jobId: string): Promise<Job>;
    private processQueue;
    getRelistedJobs(page?: number, pageSize?: number): Promise<{
        jobs: Job[];
        totalCount: number;
    }>;
    private isDuplicate;
}
