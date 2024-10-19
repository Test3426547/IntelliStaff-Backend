import { Controller, All, Req, Res, UseGuards, UseFilters, UseInterceptors, Version, Get } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiGatewayService } from './api-gateway.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AllExceptionsFilter } from './api-gateway.filter';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';

@ApiTags('api-gateway')
@Controller()
@UseGuards(AuthGuard, ThrottlerGuard)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(ResponseInterceptor)
@ApiBearerAuth()
export class ApiGatewayController {
  constructor(
    private readonly apiGatewayService: ApiGatewayService,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @All('*')
  @Version('1')
  @Throttle(100, 60)
  @ApiOperation({ summary: 'Route all requests through the API Gateway (v1)' })
  @ApiResponse({ status: 200, description: 'Request routed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async routeRequestV1(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.apiGatewayService.routeRequest(
      req.path,
      req.method,
      req.body,
      req.headers,
    );
  }

  @All('*')
  @Version('2')
  @Throttle(100, 60)
  @ApiOperation({ summary: 'Route all requests through the API Gateway (v2)' })
  @ApiResponse({ status: 200, description: 'Request routed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async routeRequestV2(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.apiGatewayService.routeRequest(
      req.path,
      req.method,
      req.body,
      req.headers,
    );
    return {
      ...result,
      apiVersion: 'v2',
    };
  }

  @Get('health')
  @HealthCheck()
  @ApiOperation({ summary: 'Check the health of the API and its dependencies' })
  @ApiResponse({ status: 200, description: 'Health check passed' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  async check() {
    return this.health.check([
      () => this.http.pingCheck('user-management', 'http://localhost:3000/user-management/health'),
      () => this.http.pingCheck('job-service', 'http://localhost:3000/jobs/health'),
      () => this.http.pingCheck('resume-service', 'http://localhost:3000/resumes/health'),
      () => this.http.pingCheck('applicant-matching-service', 'http://localhost:3000/applicant-matching/health'),
      () => this.http.pingCheck('communication-service', 'http://localhost:3000/communication/health'),
    ]);
  }
}
