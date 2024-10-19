import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { RateLimiterMemory } from 'rate-limiter-flexible';

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);
  private apiClient: AxiosInstance;
  private rateLimiter: RateLimiterMemory;

  constructor(private configService: ConfigService) {
    this.initializeApiClient();
    this.initializeRateLimiter();
  }

  private initializeApiClient() {
    this.apiClient = axios.create({
      baseURL: this.configService.get<string>('API_BASE_URL'),
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.configService.get<string>('API_KEY')}`,
      },
    });
  }

  private initializeRateLimiter() {
    this.rateLimiter = new RateLimiterMemory({
      points: 10, // Number of points
      duration: 1, // Per second
    });
  }

  async makeApiRequest(endpoint: string, method: string, data?: any): Promise<any> {
    try {
      await this.rateLimiter.consume('api_calls', 1);
      const response = await this.apiClient.request({
        url: endpoint,
        method,
        data,
      });
      return this.mapApiResponse(response.data);
    } catch (error) {
      if (error.response) {
        this.logger.error(`API request failed: ${error.response.status} - ${error.response.data}`);
      } else if (error.code === 'ECONNABORTED') {
        this.logger.error('API request timed out');
      } else {
        this.logger.error(`API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  private mapApiResponse(data: any): any {
    // Implement your data mapping logic here
    // This is a simple example, you should adapt it to your specific needs
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async getResource(id: string): Promise<any> {
    return this.makeApiRequest(`/resources/${id}`, 'GET');
  }

  async createResource(data: any): Promise<any> {
    return this.makeApiRequest('/resources', 'POST', data);
  }

  async updateResource(id: string, data: any): Promise<any> {
    return this.makeApiRequest(`/resources/${id}`, 'PUT', data);
  }

  async deleteResource(id: string): Promise<void> {
    await this.makeApiRequest(`/resources/${id}`, 'DELETE');
  }
}
