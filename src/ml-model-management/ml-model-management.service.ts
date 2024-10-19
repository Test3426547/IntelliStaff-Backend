import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as tf from '@tensorflow/tfjs-node';

@Injectable()
export class MlModelManagementService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(MlModelManagementService.name);
  private huggingfaceApiKey: string;
  private huggingfaceInferenceEndpoint: string;
  private modelCache: Map<string, any> = new Map();

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.huggingfaceApiKey = this.configService.get<string>('HUGGINGFACE_API_KEY');
    this.huggingfaceInferenceEndpoint = this.configService.get<string>('HUGGINGFACE_INFERENCE_ENDPOINT');
  }

  async getModel(modelName: string, version?: string): Promise<any> {
    const cacheKey = `${modelName}:${version || 'latest'}`;
    if (this.modelCache.has(cacheKey)) {
      return this.modelCache.get(cacheKey);
    }

    const { data, error } = await this.supabase
      .from('ml_models')
      .select('*')
      .eq('name', modelName)
      .order('version', { ascending: false })
      .limit(1);

    if (error) throw new Error(`Failed to fetch model: ${error.message}`);
    if (data.length === 0) throw new Error(`Model ${modelName} not found`);

    const model = data[0];
    this.modelCache.set(cacheKey, model);
    return model;
  }

  async updateModel(modelName: string, modelData: any): Promise<void> {
    const version = uuidv4();
    const { error } = await this.supabase
      .from('ml_models')
      .insert({ name: modelName, version, data: modelData });

    if (error) throw new Error(`Failed to update model: ${error.message}`);
    this.modelCache.clear(); // Clear cache on update
  }

  async listModels(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('ml_models')
      .select('name, version')
      .order('name', { ascending: true })
      .order('version', { ascending: false });

    if (error) throw new Error(`Failed to list models: ${error.message}`);
    return data;
  }

  async getModelPerformance(modelName: string, version?: string): Promise<any> {
    const model = await this.getModel(modelName, version);
    const { data, error } = await this.supabase
      .from('model_performance')
      .select('*')
      .eq('model_id', model.id)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error) throw new Error(`Failed to fetch model performance: ${error.message}`);
    return data[0] || null;
  }

  async runInference(modelName: string, inputData: any): Promise<any> {
    const model = await this.getModel(modelName);
    
    try {
      const response = await axios.post(
        this.huggingfaceInferenceEndpoint,
        { inputs: inputData },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingfaceApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      await this.logInference(model.id, inputData, response.data);
      return response.data;
    } catch (error) {
      this.logger.error(`Error running inference: ${error.message}`);
      throw new Error('Failed to run inference');
    }
  }

  private async logInference(modelId: string, input: any, output: any): Promise<void> {
    const { error } = await this.supabase
      .from('model_inferences')
      .insert({ model_id: modelId, input, output, timestamp: new Date().toISOString() });

    if (error) this.logger.error(`Failed to log inference: ${error.message}`);
  }

  async compareModelVersions(modelName: string, version1: string, version2: string): Promise<any> {
    const model1 = await this.getModel(modelName, version1);
    const model2 = await this.getModel(modelName, version2);
    const perf1 = await this.getModelPerformance(modelName, version1);
    const perf2 = await this.getModelPerformance(modelName, version2);

    return {
      version1: { model: model1, performance: perf1 },
      version2: { model: model2, performance: perf2 },
    };
  }

  async runABTest(modelName: string, version1: string, version2: string, testData: any[]): Promise<any> {
    const results1 = await Promise.all(testData.map(data => this.runInference(modelName, data)));
    const results2 = await Promise.all(testData.map(data => this.runInference(modelName, data)));

    // Implement your A/B test evaluation logic here
    // This is a simplified example
    const accuracy1 = this.calculateAccuracy(results1, testData);
    const accuracy2 = this.calculateAccuracy(results2, testData);

    return {
      version1: { accuracy: accuracy1 },
      version2: { accuracy: accuracy2 },
    };
  }

  private calculateAccuracy(results: any[], testData: any[]): number {
    // Implement your accuracy calculation logic here
    // This is a placeholder implementation
    return Math.random(); // Replace with actual accuracy calculation
  }

  async exportModel(modelName: string, version?: string): Promise<ArrayBuffer> {
    const model = await this.getModel(modelName, version);
    const tensorflowModel = await tf.loadLayersModel(`file://${model.data.modelPath}`);
    return await tensorflowModel.save(tf.io.withSaveHandler(async (artifacts) => {
      return artifacts;
    }));
  }

  async importModel(modelName: string, modelBuffer: ArrayBuffer): Promise<void> {
    const modelPath = `/tmp/${modelName}_${Date.now()}.json`;
    await tf.io.saveModel(tf.io.fromMemory(modelBuffer), `file://${modelPath}`);
    await this.updateModel(modelName, { modelPath });
  }
}
