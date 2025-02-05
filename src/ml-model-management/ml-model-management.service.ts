import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import * as tf from '@tensorflow/tfjs-node';
import axios from 'axios';
import * as uuid from 'uuid';

@Injectable()
export class MlModelManagementService extends HealthIndicator {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(MlModelManagementService.name);
  private huggingfaceApiKey: string;
  private huggingfaceInferenceEndpoint: string;
  private modelCache: Map<string, { model: tf.LayersModel, lastUsed: Date }> = new Map();

  constructor(private configService: ConfigService) {
    super();
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.huggingfaceApiKey = this.configService.get<string>('HUGGINGFACE_API_KEY');
    this.huggingfaceInferenceEndpoint = this.configService.get<string>('HUGGINGFACE_INFERENCE_ENDPOINT');
  }

  async checkHealth(): Promise<HealthIndicatorResult> {
    try {
      const { data, error } = await this.supabase.from('ml_models').select('id').limit(1);
      if (error) throw error;
      return this.getStatus('ml_model_management_db', true, { message: 'ML Model Management DB is healthy' });
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      throw new HealthCheckError('ML Model Management DB check failed', error);
    }
  }

  async storeModel(modelName: string, modelVersion: string, modelData: any): Promise<string> {
    try {
      const modelId = uuid.v4();
      const { error } = await this.supabase.from('ml_models').insert({
        id: modelId,
        name: modelName,
        version: modelVersion,
        data: modelData,
        created_at: new Date().toISOString(),
      });

      if (error) throw new Error(`Failed to store model: ${error.message}`);

      return modelId;
    } catch (error) {
      this.logger.error(`Error storing model: ${error.message}`);
      throw new InternalServerErrorException('Failed to store model');
    }
  }

  async retrieveModel(modelId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('ml_models')
        .select('*')
        .eq('id', modelId)
        .single();

      if (error) throw new Error(`Failed to retrieve model: ${error.message}`);

      return data;
    } catch (error) {
      this.logger.error(`Error retrieving model: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve model');
    }
  }

  async updateModel(modelId: string, updateData: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('ml_models')
        .update(updateData)
        .eq('id', modelId);

      if (error) throw new Error(`Failed to update model: ${error.message}`);
    } catch (error) {
      this.logger.error(`Error updating model: ${error.message}`);
      throw new InternalServerErrorException('Failed to update model');
    }
  }

  async deleteModel(modelId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('ml_models')
        .delete()
        .eq('id', modelId);

      if (error) throw new Error(`Failed to delete model: ${error.message}`);
    } catch (error) {
      this.logger.error(`Error deleting model: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete model');
    }
  }

  async runInference(modelId: string, inputData: any): Promise<any> {
    try {
      const model = await this.getCachedModel(modelId);
      const inputTensor = tf.tensor(inputData);
      const output = model.predict(inputTensor);
      return this.tensorToArray(output);
    } catch (error) {
      this.logger.error(`Error running inference: ${error.message}`);
      throw new InternalServerErrorException('Failed to run inference');
    }
  }

  async runHuggingFaceInference(modelName: string, inputData: any): Promise<any> {
    try {
      const response = await axios.post(
        `${this.huggingfaceInferenceEndpoint}/${modelName}`,
        { inputs: inputData },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingfaceApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error running HuggingFace inference: ${error.message}`);
      throw new InternalServerErrorException('Failed to run HuggingFace inference');
    }
  }

  async monitorModelPerformance(modelId: string, metrics: any): Promise<void> {
    try {
      const { error } = await this.supabase.from('model_performance').insert({
        model_id: modelId,
        metrics: metrics,
        timestamp: new Date().toISOString(),
      });

      if (error) throw new Error(`Failed to store model performance: ${error.message}`);
    } catch (error) {
      this.logger.error(`Error monitoring model performance: ${error.message}`);
      throw new InternalServerErrorException('Failed to monitor model performance');
    }
  }

  async getModelPerformanceHistory(modelId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('model_performance')
        .select('*')
        .eq('model_id', modelId)
        .order('timestamp', { ascending: false });

      if (error) throw new Error(`Failed to retrieve model performance history: ${error.message}`);

      return data;
    } catch (error) {
      this.logger.error(`Error getting model performance history: ${error.message}`);
      throw new InternalServerErrorException('Failed to get model performance history');
    }
  }

  async runABTest(modelAId: string, modelBId: string, testData: any): Promise<any> {
    try {
      const modelA = await this.getCachedModel(modelAId);
      const modelB = await this.getCachedModel(modelBId);

      const inputTensor = tf.tensor(testData);
      const outputA = modelA.predict(inputTensor);
      const outputB = modelB.predict(inputTensor);

      const resultA = this.tensorToArray(outputA);
      const resultB = this.tensorToArray(outputB);

      return { modelA: resultA, modelB: resultB };
    } catch (error) {
      this.logger.error(`Error running A/B test: ${error.message}`);
      throw new InternalServerErrorException('Failed to run A/B test');
    }
  }

  async getABTestHistory(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('ab_tests')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw new Error(`Failed to retrieve A/B test history: ${error.message}`);

      return data;
    } catch (error) {
      this.logger.error(`Error getting A/B test history: ${error.message}`);
      throw new InternalServerErrorException('Failed to get A/B test history');
    }
  }

  private async getCachedModel(modelId: string): Promise<tf.LayersModel> {
    if (this.modelCache.has(modelId)) {
      const cachedModel = this.modelCache.get(modelId);
      cachedModel.lastUsed = new Date();
      return cachedModel.model;
    }

    const modelData = await this.retrieveModel(modelId);
    const model = await tf.loadLayersModel(tf.io.fromMemory(modelData.data));

    this.modelCache.set(modelId, { model, lastUsed: new Date() });
    this.cleanCache();

    return model;
  }

  private cleanCache() {
    const cacheSize = this.modelCache.size;
    if (cacheSize > 10) {
      const sortedCache = Array.from(this.modelCache.entries()).sort((a, b) => b[1].lastUsed.getTime() - a[1].lastUsed.getTime());
      const modelsToRemove = sortedCache.slice(10);
      modelsToRemove.forEach(([modelId]) => this.modelCache.delete(modelId));
    }
  }

  async compareModelVersions(modelId1: string, modelId2: string): Promise<any> {
    try {
      const model1 = await this.retrieveModel(modelId1);
      const model2 = await this.retrieveModel(modelId2);

      const performanceHistory1 = await this.getModelPerformanceHistory(modelId1);
      const performanceHistory2 = await this.getModelPerformanceHistory(modelId2);

      const latestPerformance1 = performanceHistory1[0];
      const latestPerformance2 = performanceHistory2[0];

      return {
        model1: {
          id: model1.id,
          name: model1.name,
          version: model1.version,
          createdAt: model1.created_at,
          latestPerformance: latestPerformance1,
        },
        model2: {
          id: model2.id,
          name: model2.name,
          version: model2.version,
          createdAt: model2.created_at,
          latestPerformance: latestPerformance2,
        },
      };
    } catch (error) {
      this.logger.error(`Error comparing model versions: ${error.message}`);
      throw new InternalServerErrorException('Failed to compare model versions');
    }
  }

  private tensorToArray(tensor: tf.Tensor | tf.Tensor[]): any {
    if (Array.isArray(tensor)) {
      return tensor.map(t => t.arraySync());
    } else {
      return tensor.arraySync();
    }
  }
}