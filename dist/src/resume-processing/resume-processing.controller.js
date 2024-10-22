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
exports.ResumeProcessingController = void 0;
const common_1 = require("@nestjs/common");
const resume_processing_service_1 = require("./resume-processing.service");
const auth_guard_1 = require("../user-management/auth.guard");
const swagger_1 = require("@nestjs/swagger");
const terminus_1 = require("@nestjs/terminus");
let ResumeProcessingController = class ResumeProcessingController {
    constructor(resumeProcessingService, health) {
        this.resumeProcessingService = resumeProcessingService;
        this.health = health;
    }
    async processResume(id) {
        return this.resumeProcessingService.processResume(id);
    }
    async getPersonalizedFeedback(id) {
        return this.resumeProcessingService.generatePersonalizedFeedback(id);
    }
    async checkHealth() {
        return this.health.check([
            () => this.resumeProcessingService.checkHealth(),
        ]);
    }
};
exports.ResumeProcessingController = ResumeProcessingController;
__decorate([
    (0, common_1.Post)(':id/process'),
    (0, swagger_1.ApiOperation)({ summary: 'Process a resume' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resume processed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResumeProcessingController.prototype, "processResume", null);
__decorate([
    (0, common_1.Get)(':id/feedback'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate personalized feedback for a resume' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Personalized feedback generated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResumeProcessingController.prototype, "getPersonalizedFeedback", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check the health of the Resume Processing service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResumeProcessingController.prototype, "checkHealth", null);
exports.ResumeProcessingController = ResumeProcessingController = __decorate([
    (0, swagger_1.ApiTags)('resume-processing'),
    (0, common_1.Controller)('resume-processing'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [resume_processing_service_1.ResumeProcessingService,
        terminus_1.HealthCheckService])
], ResumeProcessingController);
//# sourceMappingURL=resume-processing.controller.js.map