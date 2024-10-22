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
var IntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
let IntegrationService = IntegrationService_1 = class IntegrationService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(IntegrationService_1.name);
        this.initializeApiClient();
        this.initializeRateLimiter();
    }
    initializeApiClient() {
        this.apiClient = axios_1.default.create({
            baseURL: this.configService.get('API_BASE_URL'),
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.configService.get('API_KEY')}`,
            },
        });
    }
    initializeRateLimiter() {
        this.rateLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
            points: 10,
            duration: 1,
        });
    }
    async makeApiRequest(endpoint, method, data) {
        try {
            await this.rateLimiter.consume('api_calls', 1);
            const response = await this.apiClient.request({
                url: endpoint,
                method,
                data,
            });
            return this.mapApiResponse(response.data);
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`API request failed: ${error.message}`);
                throw new Error(`API request failed: ${error.message}`);
            }
            throw error;
        }
    }
    mapApiResponse(data) {
        if (Array.isArray(data)) {
            return data.map(item => ({
                id: item.id,
                name: item.name,
                description: item.description,
                createdAt: new Date(item.created_at),
                updatedAt: new Date(item.updated_at),
            }));
        }
        else {
            return {
                id: data.id,
                name: data.name,
                description: data.description,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
            };
        }
    }
    async getExternalData(resourceId) {
        return this.makeApiRequest(`/resources/${resourceId}`, 'GET');
    }
    async createExternalResource(data) {
        return this.makeApiRequest('/resources', 'POST', data);
    }
    async updateExternalResource(resourceId, data) {
        return this.makeApiRequest(`/resources/${resourceId}`, 'PUT', data);
    }
    async deleteExternalResource(resourceId) {
        return this.makeApiRequest(`/resources/${resourceId}`, 'DELETE');
    }
};
exports.IntegrationService = IntegrationService;
exports.IntegrationService = IntegrationService = IntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], IntegrationService);
//# sourceMappingURL=integration.service.js.map