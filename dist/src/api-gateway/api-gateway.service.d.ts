import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
export declare class ApiGatewayService {
    private configService;
    private jwtService;
    private readonly logger;
    private rateLimiter;
    constructor(configService: ConfigService, jwtService: JwtService);
    private initializeRateLimiter;
    createProxyMiddleware(target: string): any;
    authenticate(token: string): Promise<boolean>;
    rateLimit(ip: string): Promise<boolean>;
    getServiceUrl(serviceName: string): string;
}
