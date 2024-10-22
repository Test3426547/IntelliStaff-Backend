import { JobIngestionService } from './job-ingestion.service';
export declare class JobIngestionController {
    private readonly jobIngestionService;
    private readonly logger;
    constructor(jobIngestionService: JobIngestionService);
    scrapeAndIngestLinkedInJobs(data: {
        searchUrl: string;
        limit?: number;
    }): Promise<any>;
    getJob(id: string): Promise<any>;
    listJobs(page?: number, limit?: number): Promise<any>;
}
