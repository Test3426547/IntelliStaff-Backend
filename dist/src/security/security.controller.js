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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityController = void 0;
const common_1 = require("@nestjs/common");
const security_service_1 = require("./security.service");
const auth_guard_1 = require("../user-management/auth.guard");
const swagger_1 = require("@nestjs/swagger");
const terminus_1 = require("@nestjs/terminus");
let SecurityController = class SecurityController {
    constructor(securityService, health) {
        this.securityService = securityService;
        this.health = health;
    }
    async encrypt(data) {
        return { encryptedText: this.securityService.encrypt(data.text, data.key) };
    }
    async decrypt(data) {
        return { decryptedText: this.securityService.decrypt(data.text, data.key) };
    }
    async createSecurityPolicy(policy) {
        await this.securityService.createSecurityPolicy(policy);
        return { message: 'Security policy created successfully' };
    }
    async getSecurityPolicies() {
        return this.securityService.getSecurityPolicies();
    }
    async detectThreats(data) {
        return this.securityService.detectThreats(data.content);
    }
    async logSecurityEvent(event) {
        await this.securityService.logSecurityEvent(event);
        return { message: 'Security event logged successfully' };
    }
    async checkHealth() {
        return this.health.check([
            () => this.securityService.checkHealth(),
        ]);
    }
};
exports.SecurityController = SecurityController;
__decorate([
    (0, common_1.Post)('encrypt'),
    (0, swagger_1.ApiOperation)({ summary: 'Encrypt data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Data encrypted successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "encrypt", null);
__decorate([
    (0, common_1.Post)('decrypt'),
    (0, swagger_1.ApiOperation)({ summary: 'Decrypt data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Data decrypted successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "decrypt", null);
__decorate([
    (0, common_1.Post)('policy'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a security policy' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Security policy created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "createSecurityPolicy", null);
__decorate([
    (0, common_1.Get)('policies'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all security policies' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Security policies retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "getSecurityPolicies", null);
__decorate([
    (0, common_1.Post)('detect-threats'),
    (0, swagger_1.ApiOperation)({ summary: 'Detect threats in data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Threat detection completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "detectThreats", null);
__decorate([
    (0, common_1.Post)('log-event'),
    (0, swagger_1.ApiOperation)({ summary: 'Log a security event' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Security event logged successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "logSecurityEvent", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check the health of the Security service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SecurityController.prototype, "checkHealth", null);
exports.SecurityController = SecurityController = __decorate([
    (0, swagger_1.ApiTags)('security'),
    (0, common_1.Controller)('security'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [security_service_1.SecurityService,
        terminus_1.HealthCheckService])
], SecurityController);
//# sourceMappingURL=security.controller.js.map