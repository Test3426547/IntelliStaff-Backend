import { SecurityService } from './security.service';
import { HealthCheckService } from '@nestjs/terminus';
export declare class SecurityController {
    private readonly securityService;
    private health;
    constructor(securityService: SecurityService, health: HealthCheckService);
    encrypt(data: {
        text: string;
        key: string;
    }): Promise<{
        encryptedText: string;
    }>;
    decrypt(data: {
        text: string;
        key: string;
    }): Promise<{
        decryptedText: string;
    }>;
    createSecurityPolicy(policy: any): Promise<{
        message: string;
    }>;
    getSecurityPolicies(): Promise<any[]>;
    detectThreats(data: {
        content: string;
    }): Promise<any>;
    logSecurityEvent(event: any): Promise<{
        message: string;
    }>;
    checkHealth(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
