import { MlModelManagementService } from './ml-model-management.service';
import { HealthCheckService } from '@nestjs/terminus';
export declare class MlModelManagementController {
    private readonly mlModelManagementService;
    private health;
    constructor(mlModelManagementService: MlModelManagementService, health: HealthCheckService);
    storeModel(modelData: {
        name: string;
        version: string;
        data: any;
    }): Promise<string>;
    retrieveModel(id: string): Promise<any>;
    updateModel(id: string, updateData: any): Promise<{
        message: string;
    }>;
    deleteModel(id: string): Promise<{
        message: string;
    }>;
    runInference(id: string, inputData: any): Promise<any>;
    runHuggingFaceInference(modelName: string, inputData: any): Promise<any>;
    monitorModelPerformance(id: string, metrics: any): Promise<{
        message: string;
    }>;
    getModelPerformanceHistory(id: string): Promise<any[]>;
    runABTest(testData: {
        modelAId: string;
        modelBId: string;
        testData: any;
    }): Promise<any>;
    getABTestHistory(): Promise<any[]>;
    compareModelVersions(id1: string, id2: string): Promise<any>;
    checkHealth(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
