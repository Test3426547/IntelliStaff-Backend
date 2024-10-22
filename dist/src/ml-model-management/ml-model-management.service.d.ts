import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
export declare class MlModelManagementService extends HealthIndicator {
    private configService;
    private supabase;
    private readonly logger;
    private huggingfaceApiKey;
    private huggingfaceInferenceEndpoint;
    private modelCache;
    constructor(configService: ConfigService);
    checkHealth(): Promise<HealthIndicatorResult>;
    storeModel(modelName: string, modelVersion: string, modelData: any): Promise<string>;
    retrieveModel(modelId: string): Promise<any>;
    updateModel(modelId: string, updateData: any): Promise<void>;
    deleteModel(modelId: string): Promise<void>;
    runInference(modelId: string, inputData: any): Promise<any>;
    runHuggingFaceInference(modelName: string, inputData: any): Promise<any>;
    monitorModelPerformance(modelId: string, metrics: any): Promise<void>;
    getModelPerformanceHistory(modelId: string): Promise<any[]>;
    runABTest(modelAId: string, modelBId: string, testData: any): Promise<any>;
    getABTestHistory(): Promise<any[]>;
    private getCachedModel;
    private cleanCache;
    compareModelVersions(modelId1: string, modelId2: string): Promise<any>;
}
