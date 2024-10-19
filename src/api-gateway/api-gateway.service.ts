import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserManagementService } from '../user-management/user-management.service';
import axios, { AxiosInstance } from 'axios';
import { JwtService } from '@nestjs/jwt';
import { RateLimiterMemory } from 'rate-limiter-flexible';

interface CircuitBreakerOptions {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
}

class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt = Date.now();

  constructor(private options: CircuitBreakerOptions) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.nextAttempt <= Date.now()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit is open');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.options.successThreshold) {
        this.successCount = 0;
        this.state = 'CLOSED';
      }
    }
  }

  private onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.options.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.options.timeout;
    }
  }
}

@Injectable()
export class ApiGatewayService {
  private serviceInstances: { [key: string]: AxiosInstance } = {};
  private rateLimiter: RateLimiterMemory;
  private circuitBreakers: { [key: string]: CircuitBreaker } = {};
  private readonly logger = new Logger(ApiGatewayService.name);

  constructor(
    private configService: ConfigService,
    private userManagementService: UserManagementService,
    private jwtService: JwtService,
  ) {
    this.initializeServiceInstances();
    this.initializeRateLimiter();
    this.initializeCircuitBreakers();
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

  private initializeCircuitBreakers() {
    Object.keys(this.serviceInstances).forEach(service => {
      this.circuitBreakers[service] = new CircuitBreaker({
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 30000, // 30 seconds
      });
    });
  }

  private async callService(service: string, config: any) {
    return this.circuitBreakers[service].execute(async () => {
      try {
        const response = await this.serviceInstances[service].request(config);
        return response.data;
      } catch (error) {
        this.logger.error(`Error calling ${service}: ${error.message}`);
        throw error;
      }
    });
  }

  async routeRequest(path: string, method: string, body: any, headers: any): Promise<any> {
    try {
      const clientIp = headers['x-forwarded-for'] || 'unknown';
      await this.rateLimiter.consume(clientIp);

      const token = this.extractTokenFromHeader(headers);
      if (!token) {
        throw new HttpException('Missing authentication token', HttpStatus.UNAUTHORIZED);
      }

      const payload = this.jwtService.verify(token);
      const user = await this.userManagementService.getUser(payload.sub);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }

      headers['X-User-Id'] = user.id;
      headers['X-User-Role'] = user.role;

      const serviceUrl = this.getServiceUrl(path);

      return await this.callService(serviceUrl, {
        method,
        url: path,
        data: body,
        headers,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error routing request: ${error.message}`);
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
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
    throw new HttpException(`No service found for path: ${path}`, HttpStatus.BAD_REQUEST);
  }
}
