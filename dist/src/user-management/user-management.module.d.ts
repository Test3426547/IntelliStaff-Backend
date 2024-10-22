import { OnModuleInit } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
export declare class UserManagementModule implements OnModuleInit {
    private userManagementService;
    constructor(userManagementService: UserManagementService);
    onModuleInit(): void;
}
