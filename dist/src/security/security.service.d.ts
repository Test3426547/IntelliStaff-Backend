import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
export declare class SecurityService extends HealthIndicator {
    private configService;
    private supabase;
    private readonly logger;
    constructor(configService: ConfigService);
    checkHealth(): Promise<HealthIndicatorResult>;
    encrypt(text: string, key: string): string;
    decrypt(text: string, key: string): string;
    createSecurityPolicy(policy: any): Promise<void>;
    getSecurityPolicies(): Promise<any[]>;
    detectThreats(data: any): Promise<any>;
    logSecurityEvent(event: any): Promise<void>;
}
