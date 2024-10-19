import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { AuthGuard } from './auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@ApiTags('user-management')
@Controller('user-management')
@ApiBearerAuth()
export class UserManagementController {
  constructor(
    private readonly userManagementService: UserManagementService,
    private health: HealthCheckService
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() userData: { email: string; password: string; role?: string }) {
    return this.userManagementService.register(userData.email, userData.password, userData.role);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  async login(@Body() loginData: { email: string; password: string; twoFactorToken?: string }) {
    return this.userManagementService.login(loginData.email, loginData.password, loginData.twoFactorToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  async logout(@Body('token') token: string) {
    await this.userManagementService.logout(token);
    return { message: 'Logged out successfully' };
  }

  @Get('user')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user information' })
  @ApiResponse({ status: 200, description: 'User information retrieved successfully' })
  async getUser(@Query('token') token: string) {
    return this.userManagementService.getUser(token);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh authentication token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.userManagementService.refreshToken(refreshToken);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset requested successfully' })
  async resetPassword(@Body('email') email: string) {
    await this.userManagementService.resetPassword(email);
    return { message: 'Password reset instructions sent to email' };
  }

  @Post('confirm-reset-password')
  @ApiOperation({ summary: 'Confirm password reset' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async confirmResetPassword(@Body() resetData: { token: string; newPassword: string }) {
    await this.userManagementService.confirmResetPassword(resetData.token, resetData.newPassword);
    return { message: 'Password reset successfully' };
  }

  @Post('enable-2fa')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Enable two-factor authentication' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  async enable2FA(@Body('userId') userId: string) {
    return this.userManagementService.enable2FA(userId);
  }

  // New RBAC endpoints

  @Post('assign-role')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  async assignRole(@Body() roleData: { userId: string; role: string }) {
    await this.userManagementService.assignRole(roleData.userId, roleData.role);
    return { message: 'Role assigned successfully' };
  }

  @Get('roles')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  async getRoles() {
    return this.userManagementService.getRoles();
  }

  @Post('roles')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  async createRole(@Body('roleName') roleName: string) {
    await this.userManagementService.createRole(roleName);
    return { message: 'Role created successfully' };
  }

  @Delete('roles/:roleName')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  async deleteRole(@Param('roleName') roleName: string) {
    await this.userManagementService.deleteRole(roleName);
    return { message: 'Role deleted successfully' };
  }

  @Get('users-with-role/:role')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get users with a specific role' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsersWithRole(@Param('role') role: string) {
    return this.userManagementService.getUsersWithRole(role);
  }

  @Get('has-permission')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Check if a user has a specific permission' })
  @ApiResponse({ status: 200, description: 'Permission check completed' })
  async hasPermission(@Query('userId') userId: string, @Query('permission') permission: string) {
    return this.userManagementService.hasPermission(userId, permission);
  }

  @Post('add-permission-to-role')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Add a permission to a role' })
  @ApiResponse({ status: 200, description: 'Permission added successfully' })
  async addPermissionToRole(@Body() permissionData: { roleName: string; permission: string }) {
    await this.userManagementService.addPermissionToRole(permissionData.roleName, permissionData.permission);
    return { message: 'Permission added to role successfully' };
  }

  @Delete('remove-permission-from-role')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Remove a permission from a role' })
  @ApiResponse({ status: 200, description: 'Permission removed successfully' })
  async removePermissionFromRole(@Body() permissionData: { roleName: string; permission: string }) {
    await this.userManagementService.removePermissionFromRole(permissionData.roleName, permissionData.permission);
    return { message: 'Permission removed from role successfully' };
  }

  @Get('health')
  @HealthCheck()
  @ApiOperation({ summary: 'Check the health of the User Management service' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async checkHealth() {
    return this.health.check([
      () => this.userManagementService.checkHealth(),
    ]);
  }
}
