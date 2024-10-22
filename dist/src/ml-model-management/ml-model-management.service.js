"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MlModelManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MlModelManagementService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const terminus_1 = require("@nestjs/terminus");
const tf = __importStar(require("@tensorflow/tfjs-node"));
const axios_1 = __importDefault(require("axios"));
const uuid = __importStar(require("uuid"));
let MlModelManagementService = MlModelManagementService_1 = class MlModelManagementService extends terminus_1.HealthIndicator {
    constructor(configService) {
        super();
        this.configService = configService;
        this.logger = new common_1.Logger(MlModelManagementService_1.name);
        this.modelCache = new Map();
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
        this.huggingfaceApiKey = this.configService.get('HUGGINGFACE_API_KEY');
        this.huggingfaceInferenceEndpoint = this.configService.get('HUGGINGFACE_INFERENCE_ENDPOINT');
    }
    async checkHealth() {
        try {
            const { data, error } = await this.supabase.from('ml_models').select('id').limit(1);
            if (error)
                throw error;
            return this.getStatus('ml_model_management_db', true, { message: 'ML Model Management DB is healthy' });
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error.message}`);
            throw new terminus_1.HealthCheckError('ML Model Management DB check failed', error);
        }
    }
    async storeModel(modelName, modelVersion, modelData) {
        try {
            const modelId = uuid.v4();
            const { error } = await this.supabase.from('ml_models').insert({
                id: modelId,
                name: modelName,
                version: modelVersion,
                data: modelData,
                created_at: new Date().toISOString(),
            });
            if (error)
                throw new Error(`Failed to store model: ${error.message}`);
            return modelId;
        }
        catch (error) {
            this.logger.error(`Error storing model: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to store model');
        }
    }
    async retrieveModel(modelId) {
        try {
            const { data, error } = await this.supabase
                .from('ml_models')
                .select('*')
                .eq('id', modelId)
                .single();
            if (error)
                throw new Error(`Failed to retrieve model: ${error.message}`);
            return data;
        }
        catch (error) {
            this.logger.error(`Error retrieving model: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to retrieve model');
        }
    }
    async updateModel(modelId, updateData) {
        try {
            const { error } = await this.supabase
                .from('ml_models')
                .update(updateData)
                .eq('id', modelId);
            if (error)
                throw new Error(`Failed to update model: ${error.message}`);
        }
        catch (error) {
            this.logger.error(`Error updating model: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to update model');
        }
    }
    async deleteModel(modelId) {
        try {
            const { error } = await this.supabase
                .from('ml_models')
                .delete()
                .eq('id', modelId);
            if (error)
                throw new Error(`Failed to delete model: ${error.message}`);
        }
        catch (error) {
            this.logger.error(`Error deleting model: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to delete model');
        }
    }
    async runInference(modelId, inputData) {
        try {
            const model = await this.getCachedModel(modelId);
            const inputTensor = tf.tensor(inputData);
            const output = model.predict(inputTensor);
            return output.arraySync();
        }
        catch (error) {
            this.logger.error(`Error running inference: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to run inference');
        }
    }
    async runHuggingFaceInference(modelName, inputData) {
        try {
            const response = await axios_1.default.post(`${this.huggingfaceInferenceEndpoint}/${modelName}`, { inputs: inputData }, {
                headers: {
                    'Authorization': `Bearer ${this.huggingfaceApiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error running HuggingFace inference: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to run HuggingFace inference');
        }
    }
    async monitorModelPerformance(modelId, metrics) {
        try {
            const { error } = await this.supabase.from('model_performance').insert({
                model_id: modelId,
                metrics: metrics,
                timestamp: new Date().toISOString(),
            });
            if (error)
                throw new Error(`Failed to store model performance: ${error.message}`);
        }
        catch (error) {
            this.logger.error(`Error monitoring model performance: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to monitor model performance');
        }
    }
    async getModelPerformanceHistory(modelId) {
        try {
            const { data, error } = await this.supabase
                .from('model_performance')
                .select('*')
                .eq('model_id', modelId)
                .order('timestamp', { ascending: false });
            if (error)
                throw new Error(`Failed to retrieve model performance history: ${error.message}`);
            return data;
        }
        catch (error) {
            this.logger.error(`Error getting model performance history: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to get model performance history');
        }
    }
    async runABTest(modelAId, modelBId, testData) {
        try {
            const modelA = await this.getCachedModel(modelAId);
            const modelB = await this.getCachedModel(modelBId);
            const inputTensor = tf.tensor(testData);
            const outputA = modelA.predict(inputTensor);
            const outputB = modelB.predict(inputTensor);
            const resultA = outputA.arraySync();
            const resultB = outputB.arraySync();
            return { modelA: resultA, modelB: resultB };
        }
        catch (error) {
            this.logger.error(`Error running A/B test: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to run A/B test');
        }
    }
    async getABTestHistory() {
        try {
            const { data, error } = await this.supabase
                .from('ab_tests')
                .select('*')
                .order('timestamp', { ascending: false });
            if (error)
                throw new Error(`Failed to retrieve A/B test history: ${error.message}`);
            return data;
        }
        catch (error) {
            this.logger.error(`Error getting A/B test history: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to get A/B test history');
        }
    }
    async getCachedModel(modelId) {
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
    cleanCache() {
        const cacheSize = this.modelCache.size;
        if (cacheSize > 10) {
            const sortedCache = Array.from(this.modelCache.entries()).sort((a, b) => b[1].lastUsed.getTime() - a[1].lastUsed.getTime());
            const modelsToRemove = sortedCache.slice(10);
            modelsToRemove.forEach(([modelId]) => this.modelCache.delete(modelId));
        }
    }
    async compareModelVersions(modelId1, modelId2) {
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
        }
        catch (error) {
            this.logger.error(`Error comparing model versions: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to compare model versions');
        }
    }
};
exports.MlModelManagementService = MlModelManagementService;
exports.MlModelManagementService = MlModelManagementService = MlModelManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MlModelManagementService);
//# sourceMappingURL=ml-model-management.service.js.map