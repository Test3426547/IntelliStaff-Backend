import { IntegrationService } from './integration.service';
export declare class IntegrationController {
    private readonly integrationService;
    constructor(integrationService: IntegrationService);
    getExternalData(resourceId: string): Promise<any>;
    createExternalResource(data: any): Promise<any>;
    updateExternalResource(resourceId: string, data: any): Promise<any>;
    deleteExternalResource(resourceId: string): Promise<any>;
}
