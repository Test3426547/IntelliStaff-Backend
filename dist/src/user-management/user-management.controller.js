"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagementController = void 0;
const common_1 = require("@nestjs/common");
const user_management_service_1 = require("./user-management.service");
const auth_guard_1 = require("./auth.guard");
const swagger_1 = require("@nestjs/swagger");
const terminus_1 = require("@nestjs/terminus");
let UserManagementController = class UserManagementController {
    constructor(userManagementService, health) {
        this.userManagementService = userManagementService;
        this.health = health;
    }
    async register(userData) {
        return this.userManagementService.register(userData.email, userData.password, userData.role);
    }
    async login(loginData) {
        return this.userManagementService.login(loginData.email, loginData.password, loginData.twoFactorToken);
    }
    async logout(token) {
        await this.userManagementService.logout(token);
        return { message: 'Logged out successfully' };
    }
    async getUser(token) {
        return this.userManagementService.getUser(token);
    }
    async refreshToken(refreshToken) {
        return this.userManagementService.refreshToken(refreshToken);
    }
    async resetPassword(email) {
        await this.userManagementService.resetPassword(email);
        return { message: 'Password reset instructions sent to email' };
    }
    async confirmResetPassword(resetData) {
        await this.userManagementService.confirmResetPassword(resetData.token, resetData.newPassword);
        return { message: 'Password reset successfully' };
    }
    async enable2FA(userId) {
        return this.userManagementService.enable2FA(userId);
    }
    async assignRole(roleData) {
        await this.userManagementService.assignRole(roleData.userId, roleData.role);
        return { message: 'Role assigned successfully' };
    }
    async getRoles() {
        return this.userManagementService.getRoles();
    }
    async createRole(roleName) {
        await this.userManagementService.createRole(roleName);
        return { message: 'Role created successfully' };
    }
    async deleteRole(roleName) {
        await this.userManagementService.deleteRole(roleName);
        return { message: 'Role deleted successfully' };
    }
    async getUsersWithRole(role) {
        return this.userManagementService.getUsersWithRole(role);
    }
    async hasPermission(userId, permission) {
        return this.userManagementService.hasPermission(userId, permission);
    }
    async addPermissionToRole(permissionData) {
        await this.userManagementService.addPermissionToRole(permissionData.roleName, permissionData.permission);
        return { message: 'Permission added to role successfully' };
    }
    async removePermissionFromRole(permissionData) {
        await this.userManagementService.removePermissionFromRole(permissionData.roleName, permissionData.permission);
        return { message: 'Permission removed from role successfully' };
    }
    async checkHealth() {
        return this.health.check([
            () => this.userManagementService.checkHealth(),
        ]);
    }
};
exports.UserManagementController = UserManagementController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User registered successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'User login' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User logged in successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'User logout' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User logged out successfully' }),
    __param(0, (0, common_1.Body)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('user'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get user information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User information retrieved successfully' }),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "getUser", null);
__decorate([
    (0, common_1.Post)('refresh-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh authentication token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token refreshed successfully' }),
    __param(0, (0, common_1.Body)('refreshToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset requested successfully' }),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('confirm-reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm password reset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "confirmResetPassword", null);
__decorate([
    (0, common_1.Post)('enable-2fa'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Enable two-factor authentication' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '2FA enabled successfully' }),
    __param(0, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "enable2FA", null);
__decorate([
    (0, common_1.Post)('assign-role'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a role to a user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Role assigned successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "assignRole", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get all roles' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Roles retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Post)('roles'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new role' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Role created successfully' }),
    __param(0, (0, common_1.Body)('roleName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "createRole", null);
__decorate([
    (0, common_1.Delete)('roles/:roleName'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a role' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Role deleted successfully' }),
    __param(0, (0, common_1.Param)('roleName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "deleteRole", null);
__decorate([
    (0, common_1.Get)('users-with-role/:role'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get users with a specific role' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Users retrieved successfully' }),
    __param(0, (0, common_1.Param)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "getUsersWithRole", null);
__decorate([
    (0, common_1.Get)('has-permission'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Check if a user has a specific permission' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Permission check completed' }),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('permission')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "hasPermission", null);
__decorate([
    (0, common_1.Post)('add-permission-to-role'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Add a permission to a role' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Permission added successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "addPermissionToRole", null);
__decorate([
    (0, common_1.Delete)('remove-permission-from-role'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a permission from a role' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Permission removed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "removePermissionFromRole", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check the health of the User Management service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserManagementController.prototype, "checkHealth", null);
exports.UserManagementController = UserManagementController = __decorate([
    (0, swagger_1.ApiTags)('user-management'),
    (0, common_1.Controller)('user-management'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [user_management_service_1.UserManagementService,
        terminus_1.HealthCheckService])
], UserManagementController);
//# sourceMappingURL=user-management.controller.js.map