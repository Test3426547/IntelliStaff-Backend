import { ConfigService } from '@nestjs/config';
import { JobProcessingService } from './job-processing.service';
export interface JobData {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    posted_date: string;
    job_type: string;
    applicants: string;
    salary: string;
    skills: string[];
    source_url: string;
}
export declare class JobIngestionService {
    private configService;
    private jobProcessingService;
    private supabase;
    private readonly logger;
    private lastScrapeTime;
    private readonly RATE_LIMIT_DELAY;
    constructor(configService: ConfigService, jobProcessingService: JobProcessingService);
    private enforceRateLimit;
    scrapeAndIngestLinkedInJobs(searchUrl: string, limit?: number): Promise<JobData[]>;
    getJobById(jobId: string): Promise<JobData | null>;
    listJobs(page?: number, limit?: number): Promise<{
        jobs: JobData[];
        total: number;
    }>;
    private logScrapingStats;
}
