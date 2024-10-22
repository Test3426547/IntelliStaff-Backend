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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobProcessingService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("@nestjs/config");
const keyword_optimizer_service_1 = require("./keyword-optimizer.service");
const tf = __importStar(require("@tensorflow/tfjs-node"));
const node_nlp_1 = require("node-nlp");
const synaptic = __importStar(require("synaptic"));
const axios_1 = __importDefault(require("axios"));
let JobProcessingService = class JobProcessingService {
    constructor(configService, keywordOptimizerService) {
        this.configService = configService;
        this.keywordOptimizerService = keywordOptimizerService;
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
        this.huggingfaceApiKey = this.configService.get('HUGGINGFACE_API_KEY');
        this.huggingfaceInferenceEndpoint = this.configService.get('HUGGINGFACE_INFERENCE_ENDPOINT');
        this.initializeModel();
        this.initializeNlpManager();
        this.initializeSynapticNetwork();
    }
    initializeModel() {
        this.model = tf.sequential();
        this.model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [10] }));
        this.model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
        this.model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
        this.model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });
    }
    initializeNlpManager() {
        this.nlpManager = new node_nlp_1.NlpManager({ languages: ['en'] });
        this.nlpManager.addDocument('en', 'We are looking for a software engineer', 'job.tech');
        this.nlpManager.addDocument('en', 'Seeking a marketing specialist', 'job.marketing');
        this.nlpManager.addDocument('en', 'Financial analyst position open', 'job.finance');
        this.nlpManager.train();
    }
    initializeSynapticNetwork() {
        this.synapticNetwork = new synaptic.Architect.Perceptron(10, 15, 1);
    }
    async optimizeJob(jobId) {
        const { data: job, error } = await this.supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single();
        if (error)
            throw new Error(`Failed to fetch job: ${error.message}`);
        const optimizedDescription = await this.enhanceJobDescription(job.description);
        const optimizedRequirements = await Promise.all(job.requirements.map(req => this.keywordOptimizerService.optimizeKeywords(req)));
        const jobFeatures = this.extractJobFeatures(job);
        const tfMatchScore = await this.predictMatchScoreTensorflow(jobFeatures);
        const synapticMatchScore = this.predictMatchScoreSynaptic(jobFeatures);
        const matchScore = (tfMatchScore + synapticMatchScore) / 2;
        const optimizedJob = Object.assign(Object.assign({}, job), { description: optimizedDescription, requirements: optimizedRequirements, matchScore });
        const { data: updatedJob, error: updateError } = await this.supabase
            .from('jobs')
            .update(optimizedJob)
            .eq('id', jobId)
            .single();
        if (updateError)
            throw new Error(`Failed to update job: ${updateError.message}`);
        return updatedJob;
    }
    extractJobFeatures(job) {
        return [
            job.title.length,
            job.description.length,
            job.requirements.length,
            job.location.length,
            job.salary ? parseFloat(job.salary.replace(/[^0-9.]/g, '')) : 0,
        ];
    }
    async predictMatchScoreTensorflow(features) {
        const tensorFeatures = tf.tensor2d([features]);
        const prediction = this.model.predict(tensorFeatures);
        const score = prediction.dataSync()[0];
        return score;
    }
    predictMatchScoreSynaptic(features) {
        return this.synapticNetwork.activate(features)[0];
    }
    async getOptimizedJobs() {
        const { data, error } = await this.supabase
            .from('jobs')
            .select('*')
            .not('description', 'eq', null);
        if (error)
            throw new Error(`Failed to fetch optimized jobs: ${error.message}`);
        return data;
    }
    async processJobs(jobIds) {
        for (const jobId of jobIds) {
            await this.optimizeJob(jobId);
        }
    }
    async enhanceJobDescription(description) {
        const result = await this.nlpManager.process('en', description);
        const jobCategory = result.intent;
        const prompt = `Enhance the following ${jobCategory} job description to make it more appealing and informative, while maintaining its core content:

${description}

Please provide an enhanced version that:
1. Improves clarity and readability
2. Highlights key responsibilities and requirements
3. Adds engaging language to attract potential candidates
4. Maintains a professional tone
5. Keeps the enhanced version concise (no more than 20% longer than the original)
6. Incorporates relevant keywords for ${jobCategory} positions`;
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
            console.error('Error calling HuggingFace Inference Endpoint:', error);
            throw new Error('Failed to enhance job description');
        }
    }
};
exports.JobProcessingService = JobProcessingService;
exports.JobProcessingService = JobProcessingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        keyword_optimizer_service_1.KeywordOptimizerService])
], JobProcessingService);
//# sourceMappingURL=job-processing.service.js.map