import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
export declare class UserManagementService extends HealthIndicator {
    private configService;
    private jwtService;
    private supabase;
    private readonly logger;
    private userCache;
    constructor(configService: ConfigService, jwtService: JwtService);
    checkHealth(): Promise<HealthIndicatorResult>;
    private retryOperation;
    register(email: string, password: string, role?: string): Promise<any>;
    login(email: string, password: string, twoFactorToken?: string): Promise<any>;
    logout(token: string): Promise<void>;
    getUser(token: string): Promise<any>;
    refreshToken(refreshToken: string): Promise<any>;
    enable2FA(userId: string): Promise<{
        secret: string;
        qrCodeUrl: string;
    }>;
    verify2FAToken(secret: string, token: string): boolean;
    private incrementLoginAttempts;
    private resetLoginAttempts;
    private lockAccount;
    private getUserRole;
    private revokeToken;
    private storeRefreshToken;
    private rotateRefreshToken;
    hasPermission(userId: string, permission: string): Promise<boolean>;
    startCacheCleanup(): void;
}
