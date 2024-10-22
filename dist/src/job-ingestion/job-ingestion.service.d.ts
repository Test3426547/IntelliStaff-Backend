import { ConfigService } from '@nestjs/config';
import { WebScraperService } from './web-scraper.service';
import { Job } from '../common/interfaces/job.interface';
import { JobProcessingService } from '../job-processing/job-processing.service';
export declare class JobIngestionService {
    private configService;
    private webScraperService;
    private jobProcessingService;
    private supabase;
    private readonly logger;
    constructor(configService: ConfigService, webScraperService: WebScraperService, jobProcessingService: JobProcessingService);
    ingestJobs(url: string, batchSize?: number, maxJobs?: number): Promise<void>;
    private normalizeJobData;
    private saveJobsInBatches;
    private saveUniqueJobsToDatabase;
    private isJobUnique;
    private triggerJobProcessing;
    getJobs(): Promise<Job[]>;
    private delay;
}
