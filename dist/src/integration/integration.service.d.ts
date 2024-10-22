import { ConfigService } from '@nestjs/config';
export declare class IntegrationService {
    private configService;
    private readonly logger;
    private apiClient;
    private rateLimiter;
    constructor(configService: ConfigService);
    private initializeApiClient;
    private initializeRateLimiter;
    makeApiRequest(endpoint: string, method: string, data?: any): Promise<any>;
    private mapApiResponse;
    getExternalData(resourceId: string): Promise<any>;
    createExternalResource(data: any): Promise<any>;
    updateExternalResource(resourceId: string, data: any): Promise<any>;
    deleteExternalResource(resourceId: string): Promise<any>;
}
