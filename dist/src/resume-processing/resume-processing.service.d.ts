import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
export declare class ResumeProcessingService extends HealthIndicator {
    private configService;
    private supabase;
    private readonly logger;
    private huggingfaceApiKey;
    private huggingfaceInferenceEndpoint;
    constructor(configService: ConfigService);
    checkHealth(): Promise<HealthIndicatorResult>;
    processResume(resumeId: string): Promise<any>;
    private getResume;
    private updateResume;
    private extractInformation;
    private enhanceInformation;
    private calculateKeywordScore;
    private calculateMLScore;
    private getOrCreateMLModel;
    private featurizeInfo;
    private calculateNLPScore;
    generatePersonalizedFeedback(resumeId: string): Promise<string>;
}
