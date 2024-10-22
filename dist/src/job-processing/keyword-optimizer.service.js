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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordOptimizerService = void 0;
const common_1 = require("@nestjs/common");
const natural = __importStar(require("natural"));
const tf = __importStar(require("@tensorflow/tfjs-node"));
let KeywordOptimizerService = class KeywordOptimizerService {
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
        this.tfidf = new natural.TfIdf();
        this.createModel();
    }
    createModel() {
        this.model = tf.sequential();
        this.model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [300] }));
        this.model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
        this.model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
        this.model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });
    }
    async optimizeKeywords(text) {
        const tokens = this.tokenizer.tokenize(text);
        this.tfidf.addDocument(tokens);
        const optimizedTokens = await Promise.all(tokens.map(async (token) => {
            const embedding = await this.getWordEmbedding(token);
            const prediction = this.model.predict(embedding);
            const score = prediction.dataSync()[0];
            return score > 0.5 ? token.toUpperCase() : token;
        }));
        return optimizedTokens.join(' ');
    }
    async getWordEmbedding(word) {
        return tf.randomNormal([1, 300]);
    }
};
exports.KeywordOptimizerService = KeywordOptimizerService;
exports.KeywordOptimizerService = KeywordOptimizerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], KeywordOptimizerService);
//# sourceMappingURL=keyword-optimizer.service.js.map