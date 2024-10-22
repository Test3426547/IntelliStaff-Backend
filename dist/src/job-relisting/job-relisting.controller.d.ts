import { JobRelistingService } from './job-relisting.service';
import { Job } from '../common/interfaces/job.interface';
export declare class JobRelistingController {
    private readonly jobRelistingService;
    constructor(jobRelistingService: JobRelistingService);
    relistJob(jobId: string): Promise<Job>;
    getRelistedJobs(page?: number, pageSize?: number): Promise<{
        jobs: Job[];
        totalCount: number;
    }>;
}
