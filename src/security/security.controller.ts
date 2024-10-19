import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { SecurityService } from './security.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../user-management/auth.guard';

@ApiTags('security')
@Controller('security')
@UseGuards(AuthGuard)
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Post('encrypt')
  @ApiOperation({ summary: 'Encrypt data' })
  @ApiResponse({ status: 200, description: 'Data encrypted successfully' })
  async encryptData(@Body('data') data: string) {
    const result = await this.securityService.encryptData(data);
    return { message: 'Data encrypted successfully', ...result };
  }

  @Post('decrypt')
  @ApiOperation({ summary: 'Decrypt data' })
  @ApiResponse({ status: 200, description: 'Data decrypted successfully' })
  async decryptData(@Body('encryptedData') encryptedData: string, @Body('iv') iv: string) {
    const decryptedData = await this.securityService.decryptData(encryptedData, iv);
    return { message: 'Data decrypted successfully', decryptedData };
  }

  @Post('detect-threats')
  @ApiOperation({ summary: 'Detect threats in data' })
  @ApiResponse({ status: 200, description: 'Threat detection completed' })
  async detectThreats(@Body() data: any) {
    const threatDetected = await this.securityService.detectThreats(data);
    return { threatDetected };
  }

  @Post('log-event')
  @ApiOperation({ summary: 'Log a security event' })
  @ApiResponse({ status: 201, description: 'Security event logged successfully' })
  async logSecurityEvent(
    @Body('userId') userId: string,
    @Body('event') event: string,
    @Body('details') details: any,
  ) {
    await this.securityService.logSecurityEvent(userId, event, details);
    return { message: 'Security event logged successfully' };
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get security logs' })
  @ApiResponse({ status: 200, description: 'Returns security logs' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSecurityLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.securityService.getSecurityLogs(page, limit);
  }
}
