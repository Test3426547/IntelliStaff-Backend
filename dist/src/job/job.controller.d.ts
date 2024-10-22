import { JobService } from './job.service';
import { JobIngestionService } from './job-ingestion.service';
import { JobProcessingService } from './job-processing.service';
import { JobRelistingService } from './job-relisting.service';
import { HealthCheckService } from '@nestjs/terminus';
export declare class JobController {
    private readonly jobService;
    private readonly jobIngestionService;
    private readonly jobProcessingService;
    private readonly jobRelistingService;
    private health;
    constructor(jobService: JobService, jobIngestionService: JobIngestionService, jobProcessingService: JobProcessingService, jobRelistingService: JobRelistingService, health: HealthCheckService);
    relistJob(id: string): Promise<any>;
    getJobRelistingStatus(id: string): Promise<any>;
}
