/// <reference types="multer" />
import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
export declare class ResumeIngestionService extends HealthIndicator {
    private configService;
    private supabase;
    private readonly logger;
    private rabbitmqConnection;
    private rabbitmqChannel;
    constructor(configService: ConfigService);
    private initializeRabbitMQ;
    uploadResume(file: Express.Multer.File): Promise<string>;
    getResumes(page?: number, limit?: number): Promise<{
        resumes: any[];
        total: number;
    }>;
    ingestResumeFromEmail(email: string): Promise<void>;
    private isResumeFile;
    checkHealth(): Promise<HealthIndicatorResult>;
}
