import { Controller, All, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiGatewayService } from './api-gateway.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('api/v1')
@UseGuards(AuthGuard, ThrottlerGuard)
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @All('*')
  async handleRequest(@Req() req: Request, @Res() res: Response) {
    const serviceName = this.getServiceName(req.path);
    const serviceUrl = this.apiGatewayService.getServiceUrl(serviceName);

    const proxy = this.apiGatewayService.createProxyMiddleware(serviceUrl);
    proxy(req, res, (err) => {
      if (err) {
        this.handleProxyError(err, res);
      }
    });
  }

  private getServiceName(path: string): string {
    const parts = path.split('/');
    return parts[2] || 'default';
  }

  private handleProxyError(err: any, res: Response) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
