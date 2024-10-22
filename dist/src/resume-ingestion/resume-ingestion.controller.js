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
exports.ResumeIngestionController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const resume_ingestion_service_1 = require("./resume-ingestion.service");
const auth_guard_1 = require("../user-management/auth.guard");
const swagger_1 = require("@nestjs/swagger");
const terminus_1 = require("@nestjs/terminus");
let ResumeIngestionController = class ResumeIngestionController {
    constructor(resumeIngestionService, health) {
        this.resumeIngestionService = resumeIngestionService;
        this.health = health;
    }
    async uploadResume(file) {
        return this.resumeIngestionService.uploadResume(file);
    }
    async ingestResumeFromEmail(email) {
        return this.resumeIngestionService.ingestResumeFromEmail(email);
    }
    async getResumes(page = 1, limit = 10) {
        return this.resumeIngestionService.getResumes(page, limit);
    }
    async checkHealth() {
        return this.health.check([
            () => this.resumeIngestionService.checkHealth(),
        ]);
    }
};
exports.ResumeIngestionController = ResumeIngestionController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a resume' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Resume uploaded successfully' }),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResumeIngestionController.prototype, "uploadResume", null);
__decorate([
    (0, common_1.Post)('ingest-email'),
    (0, swagger_1.ApiOperation)({ summary: 'Ingest resume from email' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Resume ingested from email successfully' }),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResumeIngestionController.prototype, "ingestResumeFromEmail", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get resumes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resumes retrieved successfully' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ResumeIngestionController.prototype, "getResumes", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check the health of the Resume Ingestion service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResumeIngestionController.prototype, "checkHealth", null);
exports.ResumeIngestionController = ResumeIngestionController = __decorate([
    (0, swagger_1.ApiTags)('resume-ingestion'),
    (0, common_1.Controller)('resume-ingestion'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [resume_ingestion_service_1.ResumeIngestionService,
        terminus_1.HealthCheckService])
], ResumeIngestionController);
//# sourceMappingURL=resume-ingestion.controller.js.map