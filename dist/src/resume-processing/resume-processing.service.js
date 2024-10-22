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
var ResumeProcessingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeProcessingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const terminus_1 = require("@nestjs/terminus");
const tf = __importStar(require("@tensorflow/tfjs-node"));
const natural = __importStar(require("natural"));
const axios_1 = __importDefault(require("axios"));
let ResumeProcessingService = ResumeProcessingService_1 = class ResumeProcessingService extends terminus_1.HealthIndicator {
    constructor(configService) {
        super();
        this.configService = configService;
        this.logger = new common_1.Logger(ResumeProcessingService_1.name);
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
        this.huggingfaceApiKey = this.configService.get('HUGGINGFACE_API_KEY');
        this.huggingfaceInferenceEndpoint = this.configService.get('HUGGINGFACE_INFERENCE_ENDPOINT');
    }
    async checkHealth() {
        try {
            const { data, error } = await this.supabase.from('resumes').select('id').limit(1);
            if (error)
                throw error;
            return this.getStatus('resume_processing_db', true, { message: 'Resume Processing DB is healthy' });
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error.message}`);
            throw new terminus_1.HealthCheckError('Resume Processing DB check failed', error);
        }
    }
    async processResume(resumeId) {
        try {
            const resume = await this.getResume(resumeId);
            if (!resume) {
                throw new Error(`Resume with ID ${resumeId} not found`);
            }
            const extractedInfo = await this.extractInformation(resume.content);
            const enhancedInfo = await this.enhanceInformation(extractedInfo);
            const keywordScore = await this.calculateKeywordScore(enhancedInfo);
            const mlScore = await this.calculateMLScore(enhancedInfo);
            const nlpScore = await this.calculateNLPScore(enhancedInfo);
            const processedResume = Object.assign(Object.assign({}, enhancedInfo), { keyword_score: keywordScore, ml_score: mlScore, nlp_score: nlpScore });
            await this.updateResume(resumeId, processedResume);
            return processedResume;
        }
        catch (error) {
            this.logger.error(`Error processing resume ${resumeId}: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to process resume');
        }
    }
    async getResume(resumeId) {
        const { data, error } = await this.supabase
            .from('resumes')
            .select('*')
            .eq('id', resumeId)
            .single();
        if (error) {
            throw new Error(`Failed to fetch resume: ${error.message}`);
        }
        return data;
    }
    async updateResume(resumeId, processedData) {
        const { error } = await this.supabase
            .from('resumes')
            .update(processedData)
            .eq('id', resumeId);
        if (error) {
            throw new Error(`Failed to update resume: ${error.message}`);
        }
    }
    async extractInformation(content) {
        try {
            const response = await axios_1.default.post(this.huggingfaceInferenceEndpoint, { inputs: content }, {
                headers: {
                    'Authorization': `Bearer ${this.huggingfaceApiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data[0];
        }
        catch (error) {
            this.logger.error(`Error extracting information: ${error.message}`);
            throw new Error('Failed to extract information from resume');
        }
    }
    async enhanceInformation(extractedInfo) {
        const tokenizer = new natural.WordTokenizer();
        const tokens = tokenizer.tokenize(JSON.stringify(extractedInfo));
        const enhancedInfo = Object.assign(Object.assign({}, extractedInfo), { token_count: tokens.length });
        return enhancedInfo;
    }
    async calculateKeywordScore(info) {
        const keywords = ['typescript', 'javascript', 'nodejs', 'nestjs', 'ai', 'ml'];
        const content = JSON.stringify(info).toLowerCase();
        const matchCount = keywords.filter(keyword => content.includes(keyword)).length;
        return (matchCount / keywords.length) * 100;
    }
    async calculateMLScore(info) {
        const model = await this.getOrCreateMLModel();
        const input = tf.tensor2d([this.featurizeInfo(info)]);
        const prediction = model.predict(input);
        const score = prediction.dataSync()[0] * 100;
        return Math.round(score * 100) / 100;
    }
    async getOrCreateMLModel() {
        try {
            return await tf.loadLayersModel('localstorage://resume-scoring-model');
        }
        catch (error) {
            const model = tf.sequential();
            model.add(tf.layers.dense({ units: 10, inputShape: [5], activation: 'relu' }));
            model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
            model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy' });
            await model.save('localstorage://resume-scoring-model');
            return model;
        }
    }
    featurizeInfo(info) {
        return [
            info.token_count || 0,
            (info.education && info.education.length) || 0,
            (info.work_experience && info.work_experience.length) || 0,
            (info.skills && info.skills.length) || 0,
            (info.projects && info.projects.length) || 0,
        ];
    }
    async calculateNLPScore(info) {
        const content = JSON.stringify(info);
        const sentiment = natural.SentimentAnalyzer.analyze(content);
        return (sentiment.score + 1) * 50;
    }
    async generatePersonalizedFeedback(resumeId) {
        try {
            const resume = await this.getResume(resumeId);
            if (!resume) {
                throw new Error(`Resume with ID ${resumeId} not found`);
            }
            const prompt = `Based on the following resume information, provide personalized feedback for improvement:
      ${JSON.stringify(resume)}
      
      Feedback:`;
            const response = await axios_1.default.post(this.huggingfaceInferenceEndpoint, { inputs: prompt }, {
                headers: {
                    'Authorization': `Bearer ${this.huggingfaceApiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data[0].generated_text.trim();
        }
        catch (error) {
            this.logger.error(`Error generating personalized feedback: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to generate personalized feedback');
        }
    }
};
exports.ResumeProcessingService = ResumeProcessingService;
exports.ResumeProcessingService = ResumeProcessingService = ResumeProcessingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ResumeProcessingService);
//# sourceMappingURL=resume-processing.service.js.map