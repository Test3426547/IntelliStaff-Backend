import { ConfigService } from '@nestjs/config';
export declare class JobProcessingService {
    private configService;
    private supabase;
    private readonly logger;
    private huggingfaceApiKey;
    private huggingfaceInferenceEndpoint;
    constructor(configService: ConfigService);
    processJob(jobId: string): Promise<void>;
    private getJob;
    private updateJob;
    private enhanceJobDescription;
    private extractKeywords;
    private optimizeJobTitle;
    analyzeJobMarketTrends(): Promise<any>;
}
