import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as tf from '@tensorflow/tfjs-node';
import { LoggingService } from '../common/services/logging.service';

@Injectable()
export class MlModelManagementService {
  private supabase: SupabaseClient;
  private huggingfaceApiKey: string;
  private huggingfaceInferenceEndpoint: string;
  private modelCache: Map<string, { model: any; expiration: number }> = new Map();
  private readonly CACHE_EXPIRATION = 3600000; // 1 hour in milliseconds

  constructor(
    private configService: ConfigService,
    private loggingService: LoggingService
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.huggingfaceApiKey = this.configService.get<string>('HUGGINGFACE_API_KEY');
    this.huggingfaceInferenceEndpoint = this.configService.get<string>('HUGGINGFACE_INFERENCE_ENDPOINT');
  }

  async getModel(modelName: string, version?: string): Promise<any> {
    try {
      const cacheKey = `${modelName}:${version || 'latest'}`;
      const cachedModel = this.modelCache.get(cacheKey);

      if (cachedModel && cachedModel.expiration > Date.now()) {
        this.loggingService.debug(`Cache hit for model: ${modelName}, version: ${version || 'latest'}`, 'MlModelManagementService');
        return cachedModel.model;
      }

      const { data, error } = await this.supabase
        .from('ml_models')
        .select('*')
        .eq('name', modelName)
        .order('version', { ascending: false })
        .limit(1);

      if (error) throw new InternalServerErrorException(`Failed to fetch model: ${error.message}`);
      if (data.length === 0) throw new NotFoundException(`Model ${modelName} not found`);

      const model = data[0];
      this.modelCache.set(cacheKey, { model, expiration: Date.now() + this.CACHE_EXPIRATION });
      return model;
    } catch (error) {
      this.loggingService.error(`Error in getModel: ${error.message}`, error.stack, 'MlModelManagementService');
      throw error;
    }
  }

  async updateModel(modelName: string, modelData: any, metadata: any): Promise<void> {
    try {
      if (!modelName || !modelData) {
        throw new BadRequestException('Model name and data are required');
      }

      const version = this.generateVersion();
      const { error } = await this.supabase
        .from('ml_models')
        .insert({
          name: modelName,
          version,
          data: modelData,
          metadata,
          created_at: new Date().toISOString(),
          status: 'active',
        });

      if (error) throw new InternalServerErrorException(`Failed to update model: ${error.message}`);
      
      this.modelCache.clear(); // Clear cache on update
      await this.logModelLifecycleEvent(modelName, version, 'created');
      await this.logModelUpdate(modelName, version, 'Model updated');
      this.loggingService.log(`Model ${modelName} updated successfully with version ${version}`, 'MlModelManagementService');
    } catch (error) {
      this.loggingService.error(`Error in updateModel: ${error.message}`, error.stack, 'MlModelManagementService');
      throw error;
    }
  }

  async getAllModelVersions(modelName: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('ml_models')
        .select('*')
        .eq('name', modelName)
        .order('version', { ascending: false });

      if (error) throw new InternalServerErrorException(`Failed to fetch model versions: ${error.message}`);
      if (data.length === 0) throw new NotFoundException(`Model ${modelName} not found`);

      return data;
    } catch (error) {
      this.loggingService.error(`Error in getAllModelVersions: ${error.message}`, error.stack, 'MlModelManagementService');
      throw error;
    }
  }

  async trackModelPerformance(modelName: string, version: string, metrics: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('model_performance')
        .insert({
          model_name: modelName,
          version,
          metrics,
          timestamp: new Date().toISOString(),
        });

      if (error) throw new InternalServerErrorException(`Failed to track model performance: ${error.message}`);
      this.loggingService.log(`Performance metrics tracked for model ${modelName} version ${version}`, 'MlModelManagementService');
    } catch (error) {
      this.loggingService.error(`Error in trackModelPerformance: ${error.message}`, error.stack, 'MlModelManagementService');
      throw error;
    }
  }

  async runHuggingFaceInference(modelName: string, inputData: any): Promise<any> {
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

      return response.data;
    } catch (error) {
      this.loggingService.error(`Error in runHuggingFaceInference: ${error.message}`, error.stack, 'MlModelManagementService');
      throw new InternalServerErrorException('Failed to run inference using HuggingFace API');
    }
  }

  async compareModelVersions(modelName: string, versions: string[]): Promise<any> {
    try {
      const performanceData = await Promise.all(versions.map(async (version) => {
        const { data, error } = await this.supabase
          .from('model_performance')
          .select('*')
          .eq('model_name', modelName)
          .eq('version', version)
          .order('timestamp', { ascending: false })
          .limit(1);

        if (error) throw new InternalServerErrorException(`Failed to fetch performance data: ${error.message}`);
        return { version, performance: data[0] };
      }));

      return performanceData;
    } catch (error) {
      this.loggingService.error(`Error in compareModelVersions: ${error.message}`, error.stack, 'MlModelManagementService');
      throw error;
    }
  }

  async rollbackModel(modelName: string, version: string): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('ml_models')
        .select('*')
        .eq('name', modelName)
        .eq('version', version)
        .single();

      if (error) throw new NotFoundException(`Model version not found: ${error.message}`);

      const newVersion = this.generateVersion();
      const { error: insertError } = await this.supabase
        .from('ml_models')
        .insert({
          ...data,
          version: newVersion,
          created_at: new Date().toISOString(),
          status: 'active',
        });

      if (insertError) throw new InternalServerErrorException(`Failed to rollback model: ${insertError.message}`);

      this.modelCache.clear(); // Clear cache on rollback
      await this.logModelLifecycleEvent(modelName, newVersion, 'rolled back');
      this.loggingService.log(`Model ${modelName} rolled back to version ${version} with new version ${newVersion}`, 'MlModelManagementService');
    } catch (error) {
      this.loggingService.error(`Error in rollbackModel: ${error.message}`, error.stack, 'MlModelManagementService');
      throw error;
    }
  }

  private generateVersion(): string {
    return `${new Date().toISOString().replace(/[-:T.]/g, '')}_${uuidv4().substr(0, 8)}`;
  }

  private async logModelLifecycleEvent(modelName: string, version: string, event: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('model_lifecycle_events')
        .insert({
          model_name: modelName,
          version,
          event,
          timestamp: new Date().toISOString(),
        });

      if (error) throw new Error(`Failed to log model lifecycle event: ${error.message}`);
    } catch (error) {
      this.loggingService.error(`Error in logModelLifecycleEvent: ${error.message}`, error.stack, 'MlModelManagementService');
    }
  }

  private async logModelUpdate(modelName: string, version: string, description: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('model_updates')
        .insert({
          model_name: modelName,
          version,
          description,
          timestamp: new Date().toISOString(),
        });

      if (error) throw new Error(`Failed to log model update: ${error.message}`);
    } catch (error) {
      this.loggingService.error(`Error in logModelUpdate: ${error.message}`, error.stack, 'MlModelManagementService');
    }
  }

  clearExpiredCache(): void {
    const now = Date.now();
    let clearedCount = 0;
    for (const [key, value] of this.modelCache.entries()) {
      if (value.expiration <= now) {
        this.modelCache.delete(key);
        clearedCount++;
      }
    }
    this.loggingService.debug(`Cleared ${clearedCount} expired entries from model cache`, 'MlModelManagementService');
  }

  startCacheCleanupInterval(): void {
    setInterval(() => this.clearExpiredCache(), this.CACHE_EXPIRATION);
  }
}