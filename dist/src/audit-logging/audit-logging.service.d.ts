import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
export declare class AuditLoggingService extends HealthIndicator {
    private configService;
    private supabase;
    private readonly logger;
    constructor(configService: ConfigService);
    checkHealth(): Promise<HealthIndicatorResult>;
    logActivity(userId: string, action: string, details: any): Promise<void>;
    generateAuditTrail(startDate: Date, endDate: Date): Promise<any[]>;
    createAlert(type: string, message: string, severity: 'low' | 'medium' | 'high'): Promise<void>;
    private notifyAdmins;
}
