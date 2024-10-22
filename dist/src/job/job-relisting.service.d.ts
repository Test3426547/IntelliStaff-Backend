import { ConfigService } from '@nestjs/config';
import { IntegrationService } from '../integration/integration.service';
export declare class JobRelistingService {
    private configService;
    private integrationService;
    private supabase;
    private readonly logger;
    constructor(configService: ConfigService, integrationService: IntegrationService);
    private initializeScheduler;
    relistJob(jobId: string): Promise<any>;
    private getJob;
    private isDuplicate;
    private updateJobRelistingStatus;
    getJobRelistingStatus(jobId: string): Promise<any>;
    private relistJobsDaily;
    private updateLastRelistedAt;
}
