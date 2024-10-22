import { Job } from '../common/interfaces/job.interface';
import { ConfigService } from '@nestjs/config';
export declare class PlatformIntegrationService {
    private configService;
    private readonly logger;
    private rateLimits;
    constructor(configService: ConfigService);
    relistJob(job: Job): Promise<Job>;
    private checkRateLimit;
    private postJobToPlatform;
}
