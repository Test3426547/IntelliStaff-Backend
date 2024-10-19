import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SecurityService } from './security.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@ApiTags('security')
@Controller('security')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class SecurityController {
  constructor(
    private readonly securityService: SecurityService,
    private health: HealthCheckService
  ) {}

  @Post('encrypt')
  @ApiOperation({ summary: 'Encrypt data' })
  @ApiResponse({ status: 200, description: 'Data encrypted successfully' })
  async encrypt(@Body() data: { text: string; key: string }) {
    return { encryptedText: this.securityService.encrypt(data.text, data.key) };
  }

  @Post('decrypt')
  @ApiOperation({ summary: 'Decrypt data' })
  @ApiResponse({ status: 200, description: 'Data decrypted successfully' })
  async decrypt(@Body() data: { text: string; key: string }) {
    return { decryptedText: this.securityService.decrypt(data.text, data.key) };
  }

  @Post('policy')
  @ApiOperation({ summary: 'Create a security policy' })
  @ApiResponse({ status: 201, description: 'Security policy created successfully' })
  async createSecurityPolicy(@Body() policy: any) {
    await this.securityService.createSecurityPolicy(policy);
    return { message: 'Security policy created successfully' };
  }

  @Get('policies')
  @ApiOperation({ summary: 'Get all security policies' })
  @ApiResponse({ status: 200, description: 'Security policies retrieved successfully' })
  async getSecurityPolicies() {
    return this.securityService.getSecurityPolicies();
  }

  @Post('detect-threats')
  @ApiOperation({ summary: 'Detect threats in data' })
  @ApiResponse({ status: 200, description: 'Threat detection completed' })
  async detectThreats(@Body() data: { content: string }) {
    return this.securityService.detectThreats(data.content);
  }

  @Post('log-event')
  @ApiOperation({ summary: 'Log a security event' })
  @ApiResponse({ status: 201, description: 'Security event logged successfully' })
  async logSecurityEvent(@Body() event: any) {
    await this.securityService.logSecurityEvent(event);
    return { message: 'Security event logged successfully' };
  }

  @Get('health')
  @HealthCheck()
  @ApiOperation({ summary: 'Check the health of the Security service' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async checkHealth() {
    return this.health.check([
      () => this.securityService.checkHealth(),
    ]);
  }
}
