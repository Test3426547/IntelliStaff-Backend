import { Controller, Post, Body, Get, Headers, UseGuards, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@ApiTags('user-management')
@Controller('user-management')
export class UserManagementController {
  constructor(
    private readonly userManagementService: UserManagementService,
    private health: HealthCheckService
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body('email') email: string, @Body('password') password: string, @Body('role') role: string = 'user') {
    const user = await this.userManagementService.register(email, password, role);
    return { message: 'User registered successfully', user };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  async login(@Body('email') email: string, @Body('password') password: string) {
    const session = await this.userManagementService.login(email, password);
    return { message: 'User logged in successfully', session };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async logout(@Headers('authorization') auth: string) {
    const token = auth.split(' ')[1];
    await this.userManagementService.logout(token);
    return { message: 'User logged out successfully' };
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getProfile(@Headers('authorization') auth: string) {
    const token = auth.split(' ')[1];
    const user = await this.userManagementService.getUser(token);
    return { user };
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh user token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    const newSession = await this.userManagementService.refreshToken(refreshToken);
    return { message: 'Token refreshed successfully', session: newSession };
  }

  @Post('reset-password-request')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent successfully' })
  async resetPasswordRequest(@Body('email') email: string) {
    await this.userManagementService.resetPassword(email);
    return { message: 'Password reset email sent successfully' };
  }

  @Post('reset-password-confirm')
  @ApiOperation({ summary: 'Confirm password reset' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPasswordConfirm(@Body('token') token: string, @Body('newPassword') newPassword: string) {
    await this.userManagementService.confirmResetPassword(token, newPassword);
    return { message: 'Password reset successfully' };
  }

  @Post('enable-2fa')
  @ApiOperation({ summary: 'Enable 2FA for a user' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async enable2FA(@Headers('authorization') auth: string) {
    const token = auth.split(' ')[1];
    const user = await this.userManagementService.getUser(token);
    const secret = await this.userManagementService.enable2FA(user.id);
    return { message: '2FA enabled successfully', secret };
  }

  @Post('verify-2fa')
  @ApiOperation({ summary: 'Verify 2FA token' })
  @ApiResponse({ status: 200, description: '2FA token verified successfully' })
  @ApiHeader({ name: 'Authorization', description: 'Bearer token' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async verify2FA(@Headers('authorization') auth: string, @Body('token') token: string) {
    const authToken = auth.split(' ')[1];
    const user = await this.userManagementService.getUser(authToken);
    const isValid = await this.userManagementService.verify2FA(user.id, token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA token');
    }
    return { message: '2FA token verified successfully' };
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