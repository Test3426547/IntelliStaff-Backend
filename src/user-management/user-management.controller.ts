import { Controller, Post, Body, Get, Headers, UseGuards } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';

@ApiTags('user-management')
@Controller('user-management')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

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

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: 200, description: 'Password reset email sent successfully' })
  async resetPassword(@Body('email') email: string) {
    await this.userManagementService.resetPassword(email);
    return { message: 'Password reset email sent successfully' };
  }
}
