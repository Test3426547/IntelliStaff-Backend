import { JobProcessingService } from './job-processing.service';
import { Job } from '../common/interfaces/job.interface';
export declare class JobProcessingController {
    private readonly jobProcessingService;
    constructor(jobProcessingService: JobProcessingService);
    optimizeJob(jobId: string): Promise<Job>;
    getOptimizedJobs(): Promise<Job[]>;
    processJobs(jobIds: string[]): Promise<void>;
}
