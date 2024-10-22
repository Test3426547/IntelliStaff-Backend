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
var PlatformIntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@nestjs/config");
let PlatformIntegrationService = PlatformIntegrationService_1 = class PlatformIntegrationService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PlatformIntegrationService_1.name);
        this.rateLimits = new Map();
        this.rateLimits.set('seek', { lastCall: 0, limit: 5000 });
        this.rateLimits.set('indeed', { lastCall: 0, limit: 10000 });
        this.rateLimits.set('linkedin', { lastCall: 0, limit: 15000 });
    }
    async relistJob(job) {
        const platforms = ['seek', 'indeed', 'linkedin'];
        const relistedPlatforms = [];
        for (const platform of platforms) {
            try {
                await this.checkRateLimit(platform);
                await this.postJobToPlatform(platform, job);
                relistedPlatforms.push(platform);
                this.logger.log(`Job successfully relisted on ${platform}`);
            }
            catch (error) {
                this.logger.error(`Failed to relist job on ${platform}: ${error.message}`);
            }
        }
        return Object.assign(Object.assign({}, job), { relistedPlatforms });
    }
    async checkRateLimit(platform) {
        const rateLimit = this.rateLimits.get(platform);
        if (!rateLimit)
            return;
        const now = Date.now();
        const timeSinceLastCall = now - rateLimit.lastCall;
        if (timeSinceLastCall < rateLimit.limit) {
            const delay = rateLimit.limit - timeSinceLastCall;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        rateLimit.lastCall = Date.now();
    }
    async postJobToPlatform(platform, job) {
        const apiUrl = this.configService.get(`${platform.toUpperCase()}_API_URL`);
        const apiKey = this.configService.get(`${platform.toUpperCase()}_API_KEY`);
        if (!apiUrl || !apiKey) {
            throw new Error(`Missing configuration for ${platform}`);
        }
        try {
            await axios_1.default.post(apiUrl, job, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
        }
        catch (error) {
            throw new Error(`API call to ${platform} failed: ${error.message}`);
        }
    }
};
exports.PlatformIntegrationService = PlatformIntegrationService;
exports.PlatformIntegrationService = PlatformIntegrationService = PlatformIntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PlatformIntegrationService);
//# sourceMappingURL=platform-integration.service.js.map