import { ConfigService } from '@nestjs/config';
import { KeywordOptimizerService } from './keyword-optimizer.service';
import { Job } from '../common/interfaces/job.interface';
export declare class JobProcessingService {
    private configService;
    private keywordOptimizerService;
    private supabase;
    private model;
    private nlpManager;
    private synapticNetwork;
    private huggingfaceApiKey;
    private huggingfaceInferenceEndpoint;
    constructor(configService: ConfigService, keywordOptimizerService: KeywordOptimizerService);
    private initializeModel;
    private initializeNlpManager;
    private initializeSynapticNetwork;
    optimizeJob(jobId: string): Promise<Job>;
    private extractJobFeatures;
    private predictMatchScoreTensorflow;
    private predictMatchScoreSynaptic;
    getOptimizedJobs(): Promise<Job[]>;
    processJobs(jobIds: string[]): Promise<void>;
    private enhanceJobDescription;
}
