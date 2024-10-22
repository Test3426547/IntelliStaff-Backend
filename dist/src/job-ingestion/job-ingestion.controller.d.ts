import { JobIngestionService } from './job-ingestion.service';
import { Job } from '../common/interfaces/job.interface';
export declare class JobIngestionController {
    private readonly jobIngestionService;
    constructor(jobIngestionService: JobIngestionService);
    ingestJobs(url: string, batchSize?: number, maxJobs?: number): Promise<{
        message: string;
    }>;
    getJobs(): Promise<Job[]>;
}
