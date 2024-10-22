import { AuditLoggingService } from './audit-logging.service';
import { HealthCheckService } from '@nestjs/terminus';
export declare class AuditLoggingController {
    private readonly auditLoggingService;
    private health;
    constructor(auditLoggingService: AuditLoggingService, health: HealthCheckService);
    logActivity(activityData: {
        userId: string;
        action: string;
        details: any;
    }): Promise<{
        message: string;
    }>;
    generateAuditTrail(startDate: string, endDate: string): Promise<any[]>;
    createAlert(alertData: {
        type: string;
        message: string;
        severity: 'low' | 'medium' | 'high';
    }): Promise<{
        message: string;
    }>;
    checkHealth(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
