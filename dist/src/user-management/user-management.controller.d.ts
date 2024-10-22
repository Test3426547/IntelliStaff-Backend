import { UserManagementService } from './user-management.service';
import { HealthCheckService } from '@nestjs/terminus';
export declare class UserManagementController {
    private readonly userManagementService;
    private health;
    constructor(userManagementService: UserManagementService, health: HealthCheckService);
    register(userData: {
        email: string;
        password: string;
        role?: string;
    }): Promise<any>;
    login(loginData: {
        email: string;
        password: string;
        twoFactorToken?: string;
    }): Promise<any>;
    logout(token: string): Promise<{
        message: string;
    }>;
    getUser(token: string): Promise<any>;
    refreshToken(refreshToken: string): Promise<any>;
    resetPassword(email: string): Promise<{
        message: string;
    }>;
    confirmResetPassword(resetData: {
        token: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    enable2FA(userId: string): Promise<{
        secret: string;
        qrCodeUrl: string;
    }>;
    assignRole(roleData: {
        userId: string;
        role: string;
    }): Promise<{
        message: string;
    }>;
    getRoles(): Promise<any>;
    createRole(roleName: string): Promise<{
        message: string;
    }>;
    deleteRole(roleName: string): Promise<{
        message: string;
    }>;
    getUsersWithRole(role: string): Promise<any>;
    hasPermission(userId: string, permission: string): Promise<boolean>;
    addPermissionToRole(permissionData: {
        roleName: string;
        permission: string;
    }): Promise<{
        message: string;
    }>;
    removePermissionFromRole(permissionData: {
        roleName: string;
        permission: string;
    }): Promise<{
        message: string;
    }>;
    checkHealth(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
