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
var ApiGatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
let ApiGatewayService = ApiGatewayService_1 = class ApiGatewayService {
    constructor(configService, jwtService) {
        this.configService = configService;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(ApiGatewayService_1.name);
        this.initializeRateLimiter();
    }
    initializeRateLimiter() {
        this.rateLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
            points: 10,
            duration: 1,
        });
    }
    createProxyMiddleware(target) {
        return (0, http_proxy_middleware_1.createProxyMiddleware)({
            target,
            changeOrigin: true,
            pathRewrite: {
                [`^/api/v1`]: '',
            },
        });
    }
    async authenticate(token) {
        try {
            await this.jwtService.verify(token);
            return true;
        }
        catch (error) {
            this.logger.error(`Authentication failed: ${error.message}`);
            return false;
        }
    }
    async rateLimit(ip) {
        try {
            await this.rateLimiter.consume(ip);
            return true;
        }
        catch (error) {
            this.logger.warn(`Rate limit exceeded for IP: ${ip}`);
            return false;
        }
    }
    getServiceUrl(serviceName) {
        const serviceUrl = this.configService.get(`${serviceName.toUpperCase()}_SERVICE_URL`);
        if (!serviceUrl) {
            throw new Error(`Service URL not found for ${serviceName}`);
        }
        return serviceUrl;
    }
};
exports.ApiGatewayService = ApiGatewayService;
exports.ApiGatewayService = ApiGatewayService = ApiGatewayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService])
], ApiGatewayService);
//# sourceMappingURL=api-gateway.service.js.map