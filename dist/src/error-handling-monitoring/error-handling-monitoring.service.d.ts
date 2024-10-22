import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
export declare class ErrorHandlingMonitoringService extends HealthIndicator implements OnModuleInit {
    private configService;
    private readonly logger;
    private supabase;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    checkHealth(): Promise<HealthIndicatorResult>;
    captureException(error: Error, context?: any): void;
    captureMessage(message: string, level?: Sentry.Severity, context?: any): void;
    getErrorLogs(page?: number, limit?: number): Promise<any>;
    getPerformanceMetrics(startDate: Date, endDate: Date): Promise<any>;
    recordPerformanceMetric(metricName: string, value: number): Promise<void>;
    private logError;
    private logMessage;
}
