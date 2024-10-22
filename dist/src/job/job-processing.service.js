"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var JobProcessingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobProcessingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const axios_1 = __importDefault(require("axios"));
let JobProcessingService = JobProcessingService_1 = class JobProcessingService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(JobProcessingService_1.name);
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
        this.huggingfaceApiKey = this.configService.get('HUGGINGFACE_API_KEY');
        this.huggingfaceInferenceEndpoint = this.configService.get('HUGGINGFACE_INFERENCE_ENDPOINT');
    }
    async processJob(jobId) {
        try {
            const job = await this.getJob(jobId);
            if (!job) {
                throw new Error(`Job with ID ${jobId} not found`);
            }
            const enhancedDescription = await this.enhanceJobDescription(job.description);
            const keywords = await this.extractKeywords(enhancedDescription);
            const optimizedTitle = await this.optimizeJobTitle(job.title);
            await this.updateJob(jobId, {
                enhanced_description: enhancedDescription,
                keywords: keywords,
                optimized_title: optimizedTitle,
            });
            this.logger.log(`Job ${jobId} processed successfully`);
        }
        catch (error) {
            this.logger.error(`Error processing job ${jobId}: ${error.message}`);
            throw error;
        }
    }
    async getJob(jobId) {
        const { data, error } = await this.supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single();
        if (error) {
            throw new Error(`Failed to fetch job: ${error.message}`);
        }
        return data;
    }
    async updateJob(jobId, updateData) {
        const { error } = await this.supabase
            .from('jobs')
            .update(updateData)
            .eq('id', jobId);
        if (error) {
            throw new Error(`Failed to update job: ${error.message}`);
        }
    }
    async enhanceJobDescription(description) {
        const prompt = `Enhance the following job description to make it more engaging and informative:

${description}

Enhanced description:`;
        try {
            const response = await axios_1.default.post(this.huggingfaceInferenceEndpoint, { inputs: prompt }, {
                headers: {
                    'Authorization': `Bearer ${this.huggingfaceApiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data[0].generated_text.trim();
        }
        catch (error) {
            this.logger.error(`Error enhancing job description: ${error.message}`);
            return description;
        }
    }
    async extractKeywords(text) {
        const prompt = `Extract the top 10 most relevant keywords from the following text:

${text}

Keywords:`;
        try {
            const response = await axios_1.default.post(this.huggingfaceInferenceEndpoint, { inputs: prompt }, {
                headers: {
                    'Authorization': `Bearer ${this.huggingfaceApiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            const keywordsText = response.data[0].generated_text.trim();
            return keywordsText.split(',').map(keyword => keyword.trim());
        }
        catch (error) {
            this.logger.error(`Error extracting keywords: ${error.message}`);
            return [];
        }
    }
    async optimizeJobTitle(title) {
        const prompt = `Optimize the following job title to make it more attractive and SEO-friendly:

${title}

Optimized title:`;
        try {
            const response = await axios_1.default.post(this.huggingfaceInferenceEndpoint, { inputs: prompt }, {
                headers: {
                    'Authorization': `Bearer ${this.huggingfaceApiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data[0].generated_text.trim();
        }
        catch (error) {
            this.logger.error(`Error optimizing job title: ${error.message}`);
            return title;
        }
    }
    async analyzeJobMarketTrends() {
        try {
            const { data, error } = await this.supabase
                .from('jobs')
                .select('title, description, keywords')
                .order('created_at', { ascending: false })
                .limit(100);
            if (error) {
                throw new Error(`Failed to fetch recent jobs: ${error.message}`);
            }
            const allKeywords = data.flatMap(job => job.keywords || []);
            const keywordFrequency = allKeywords.reduce((acc, keyword) => {
                acc[keyword] = (acc[keyword] || 0) + 1;
                return acc;
            }, {});
            const sortedTrends = Object.entries(keywordFrequency)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([keyword, count]) => ({ keyword, count }));
            return {
                topTrends: sortedTrends,
                totalJobsAnalyzed: data.length,
            };
        }
        catch (error) {
            this.logger.error(`Error analyzing job market trends: ${error.message}`);
            throw error;
        }
    }
};
exports.JobProcessingService = JobProcessingService;
exports.JobProcessingService = JobProcessingService = JobProcessingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], JobProcessingService);
//# sourceMappingURL=job-processing.service.js.map