import { CanActivate, ExecutionContext } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
export declare class AuthGuard implements CanActivate {
    private userManagementService;
    constructor(userManagementService: UserManagementService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
