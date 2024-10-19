import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserManagementService } from '../user-management/user-management.service';
import axios, { AxiosInstance } from 'axios';
import { JwtService } from '@nestjs/jwt';
import { LoggingService } from '../common/services/logging.service';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { createError, ErrorCodes } from '../common/error-codes';
import * as joi from 'joi';
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class ApiGatewayService {
  private serviceInstances: { [key: string]: AxiosInstance } = {};
  private rateLimiter: RateLimiterMemory;
  private endpointRateLimiters: { [key: string]: RateLimiterMemory } = {};

  constructor(
    private configService: ConfigService,
    private userManagementService: UserManagementService,
    private jwtService: JwtService,
    private loggingService: LoggingService,
  ) {
    this.initializeServiceInstances();
    this.initializeRateLimiter();
    this.initializeEndpointRateLimiters();
  }

  private initializeServiceInstances() {
    const services = [
      'USER_SERVICE',
      'JOB_SERVICE',
      'RESUME_SERVICE',
      'ANALYTICS_SERVICE',
      'ML_MODEL_SERVICE',
    ];

    services.forEach(service => {
      const url = this.configService.get<string>(`${service}_URL`);
      if (url) {
        this.serviceInstances[service] = axios.create({
          baseURL: url,
          timeout: 5000,
        });
      }
    });
  }

  private initializeRateLimiter() {
    this.rateLimiter = new RateLimiterMemory({
      points: 100,
      duration: 60,
    });
  }

  private initializeEndpointRateLimiters() {
    const sensitiveEndpoints = [
      { path: '/user/login', points: 5, duration: 60 },
      { path: '/user/register', points: 3, duration: 3600 },
      { path: '/user/reset-password', points: 3, duration: 3600 },
    ];

    sensitiveEndpoints.forEach(endpoint => {
      this.endpointRateLimiters[endpoint.path] = new RateLimiterMemory({
        points: endpoint.points,
        duration: endpoint.duration,
      });
    });
  }

  async routeRequest(path: string, method: string, body: any, headers: any): Promise<any> {
    try {
      // Global rate limiting
      const clientIp = headers['x-forwarded-for'] || 'unknown';
      await this.rateLimiter.consume(clientIp);

      // Endpoint-specific rate limiting
      if (this.endpointRateLimiters[path]) {
        await this.endpointRateLimiters[path].consume(clientIp);
      }

      // Token validation
      const token = this.extractTokenFromHeader(headers);
      if (!token) {
        throw createError(ErrorCodes.UNAUTHORIZED, 'Missing authentication token');
      }

      // Enhanced JWT token validation
      let payload: any;
      try {
        payload = this.jwtService.verify(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });
      } catch (error) {
        throw createError(ErrorCodes.UNAUTHORIZED, 'Invalid authentication token');
      }

      const user = await this.userManagementService.getUser(payload.sub);
      if (!user) {
        throw createError(ErrorCodes.UNAUTHORIZED, 'User not found');
      }

      // Check if the token is revoked
      const isRevoked = await this.userManagementService.isTokenRevoked(token);
      if (isRevoked) {
        throw createError(ErrorCodes.UNAUTHORIZED, 'Token has been revoked');
      }

      headers['X-User-Id'] = user.id;
      headers['X-User-Role'] = user.role;
      
      const apiVersion = this.extractApiVersion(path);
      headers['X-API-Version'] = apiVersion;

      // Validate API version
      if (!this.isValidApiVersion(apiVersion)) {
        throw createError(ErrorCodes.BAD_REQUEST, 'Invalid API version');
      }

      // Input validation and sanitization
      this.validateAndSanitizeInput(method, body);

      const serviceUrl = this.getServiceUrl(path);
      const response = await this.serviceInstances[serviceUrl].request({
        method,
        url: this.removeVersionFromPath(path),
        data: body,
        headers,
      });

      this.loggingService.log(`Request routed successfully: ${method} ${path}`, 'ApiGatewayService');
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        this.loggingService.error(`Error routing request: ${error.message}`, error.stack, 'ApiGatewayService');
      }
      throw error;
    }
  }

  private extractTokenFromHeader(headers: any): string | undefined {
    const [type, token] = headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private getServiceUrl(path: string): string {
    if (path.includes('/user')) return 'USER_SERVICE';
    if (path.includes('/job')) return 'JOB_SERVICE';
    if (path.includes('/resume')) return 'RESUME_SERVICE';
    if (path.includes('/analytics')) return 'ANALYTICS_SERVICE';
    if (path.includes('/ml-model')) return 'ML_MODEL_SERVICE';
    throw createError(ErrorCodes.BAD_REQUEST, `No service found for path: ${path}`);
  }

  private extractApiVersion(path: string): string {
    const versionMatch = path.match(/^\/v(\d+)/);
    return versionMatch ? `v${versionMatch[1]}` : 'v1';
  }

  private isValidApiVersion(version: string): boolean {
    const validVersions = ['v1', 'v2'];
    return validVersions.includes(version);
  }

  private removeVersionFromPath(path: string): string {
    return path.replace(/^\/v\d+/, '');
  }

  private validateAndSanitizeInput(method: string, body: any): void {
    const schema = joi.object({
      id: joi.string().uuid(),
      email: joi.string().email(),
      name: joi.string().min(2).max(100),
      age: joi.number().integer().min(18).max(120),
      // Add more fields as needed
    }).unknown(true);

    const { error, value } = schema.validate(body, { abortEarly: false });
    if (error) {
      const errorMessages = error.details.map(detail => detail.message).join(', ');
      throw createError(ErrorCodes.BAD_REQUEST, `Invalid input: ${errorMessages}`);
    }

    // Sanitize input
    Object.keys(value).forEach(key => {
      if (typeof value[key] === 'string') {
        value[key] = sanitizeHtml(value[key]);
      }
    });

    body = value;
  }
}