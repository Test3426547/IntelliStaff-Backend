import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserManagementService } from '../user-management/user-management.service';
import axios, { AxiosInstance } from 'axios';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ApiGatewayService {
  private readonly logger = new Logger(ApiGatewayService.name);
  private serviceInstances: { [key: string]: AxiosInstance } = {};

  constructor(
    private configService: ConfigService,
    private userManagementService: UserManagementService,
    private jwtService: JwtService,
  ) {
    this.initializeServiceInstances();
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

  async routeRequest(path: string, method: string, body: any, headers: any): Promise<any> {
    try {
      const token = this.extractTokenFromHeader(headers);
      if (!token) {
        throw new UnauthorizedException('Missing authentication token');
      }

      const payload = this.jwtService.verify(token);
      const user = await this.userManagementService.getUser(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid authentication token');
      }

      headers['X-User-Id'] = user.id;
      headers['X-User-Role'] = user.role;
      headers['X-API-Version'] = this.extractApiVersion(path);

      const serviceUrl = this.getServiceUrl(path);
      const response = await this.serviceInstances[serviceUrl].request({
        method,
        url: this.removeVersionFromPath(path),
        data: body,
        headers,
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Error routing request: ${error.message}`);
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
    throw new Error(`No service found for path: ${path}`);
  }

  private extractApiVersion(path: string): string {
    const versionMatch = path.match(/^\/v(\d+)/);
    return versionMatch ? `v${versionMatch[1]}` : 'v1';
  }

  private removeVersionFromPath(path: string): string {
    return path.replace(/^\/v\d+/, '');
  }
}
