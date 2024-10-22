import { ErrorHandlingMonitoringService } from './error-handling-monitoring.service';
import { HealthCheckService } from '@nestjs/terminus';
export declare class ErrorHandlingMonitoringController {
    private readonly errorHandlingMonitoringService;
    private health;
    constructor(errorHandlingMonitoringService: ErrorHandlingMonitoringService, health: HealthCheckService);
    logError(errorData: {
        message: string;
        stack?: string;
        context?: any;
    }): Promise<{
        message: string;
    }>;
    logMessage(messageData: {
        message: string;
        level: string;
        context?: any;
    }): Promise<{
        message: string;
    }>;
    getErrorLogs(page?: number, limit?: number): Promise<any>;
    getPerformanceMetrics(startDate: string, endDate: string): Promise<any>;
    recordPerformanceMetric(metricData: {
        name: string;
        value: number;
    }): Promise<{
        message: string;
    }>;
    checkHealth(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
