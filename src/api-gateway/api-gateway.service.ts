import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { RateLimiterMemory } from 'rate-limiter-flexible';

@Injectable()
export class ApiGatewayService {
  private readonly logger = new Logger(ApiGatewayService.name);
  private rateLimiter: RateLimiterMemory;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    this.initializeRateLimiter();
  }

  private initializeRateLimiter() {
    this.rateLimiter = new RateLimiterMemory({
      points: 10, // Number of points
      duration: 1, // Per second
    });
  }

  createProxyMiddleware(target: string) {
    return createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: {
        [`^/api/v1`]: '',
      },
    });
  }

  async authenticate(token: string): Promise<boolean> {
    try {
      await this.jwtService.verify(token);
      return true;
    } catch (error) {
      this.logger.error(`Authentication failed: ${error.message}`);
      return false;
    }
  }

  async rateLimit(ip: string): Promise<boolean> {
    try {
      await this.rateLimiter.consume(ip);
      return true;
    } catch (error) {
      this.logger.warn(`Rate limit exceeded for IP: ${ip}`);
      return false;
    }
  }

  getServiceUrl(serviceName: string): string {
    const serviceUrl = this.configService.get<string>(`${serviceName.toUpperCase()}_SERVICE_URL`);
    if (!serviceUrl) {
      throw new Error(`Service URL not found for ${serviceName}`);
    }
    return serviceUrl;
  }
}
