import { Controller, All, Req, Res, UseGuards, UseInterceptors, UseFilters, Version } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiGatewayService } from './api-gateway.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiVersion } from '@nestjs/swagger';
import { AllExceptionsFilter } from './api-gateway.filter';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';

@ApiTags('api-gateway')
@Controller()
@UseGuards(AuthGuard, ThrottlerGuard)
@UseFilters(AllExceptionsFilter)
@UseInterceptors(ResponseInterceptor)
@ApiBearerAuth()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @All('*')
  @Version('1')
  @Throttle(10, 60)
  @ApiOperation({ summary: 'Route all requests through the API Gateway (v1)' })
  @ApiResponse({ status: 200, description: 'Request routed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiVersion('1')
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
  @Throttle(10, 60)
  @ApiOperation({ summary: 'Route all requests through the API Gateway (v2)' })
  @ApiResponse({ status: 200, description: 'Request routed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiVersion('2')
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
}
