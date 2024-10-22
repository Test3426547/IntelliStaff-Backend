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
      if (error instanceof Error) {
        this.logger.error(`API request failed: ${error.message}`);
        throw new Error(`API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  private mapApiResponse(data: any): any {
    // Implement your data mapping logic here
    // This is a simple example, adapt it to your specific needs
    if (Array.isArray(data)) {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));
    } else {
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    }
  }

  async getExternalData(resourceId: string): Promise<any> {
    return this.makeApiRequest(`/resources/${resourceId}`, 'GET');
  }

  async createExternalResource(data: any): Promise<any> {
    return this.makeApiRequest('/resources', 'POST', data);
  }

  async updateExternalResource(resourceId: string, data: any): Promise<any> {
    return this.makeApiRequest(`/resources/${resourceId}`, 'PUT', data);
  }

  async deleteExternalResource(resourceId: string): Promise<any> {
    return this.makeApiRequest(`/resources/${resourceId}`, 'DELETE');
  }

  async relistJobOnExternalPlatforms(job: any): Promise<any> {
    try {
      // Implement the logic to relist the job on external platforms
      // This is a placeholder implementation
      const relistingResult = await this.makeApiRequest('/relist-job', 'POST', job);
      this.logger.log(`Job ${job.id} relisted on external platforms`);
      return relistingResult;
    } catch (error) {
      this.logger.error(`Error relisting job ${job.id} on external platforms: ${error.message}`);
      throw error;
    }
  }
}
