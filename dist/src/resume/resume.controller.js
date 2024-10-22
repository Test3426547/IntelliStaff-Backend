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
exports.ResumeController = void 0;
const common_1 = require("@nestjs/common");
const resume_service_1 = require("./resume.service");
const auth_guard_1 = require("../user-management/auth.guard");
const swagger_1 = require("@nestjs/swagger");
const terminus_1 = require("@nestjs/terminus");
let ResumeController = class ResumeController {
    constructor(resumeService, health) {
        this.resumeService = resumeService;
        this.health = health;
    }
    async createResume(resumeData) {
        return this.resumeService.createResume(resumeData);
    }
    async getResume(id) {
        return this.resumeService.getResume(id);
    }
    async updateResume(id, resumeData) {
        return this.resumeService.updateResume(id, resumeData);
    }
    async deleteResume(id) {
        await this.resumeService.deleteResume(id);
        return { message: 'Resume deleted successfully' };
    }
    async listResumes(page = 1, limit = 10) {
        return this.resumeService.listResumes(page, limit);
    }
    async checkHealth() {
        return this.health.check([
            () => this.resumeService.checkHealth(),
        ]);
    }
};
exports.ResumeController = ResumeController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new resume' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Resume created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResumeController.prototype, "createResume", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a resume by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resume retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResumeController.prototype, "getResume", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a resume' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resume updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ResumeController.prototype, "updateResume", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a resume' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resume deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResumeController.prototype, "deleteResume", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List resumes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resumes listed successfully' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ResumeController.prototype, "listResumes", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check the health of the Resume service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ResumeController.prototype, "checkHealth", null);
exports.ResumeController = ResumeController = __decorate([
    (0, swagger_1.ApiTags)('resumes'),
    (0, common_1.Controller)('resumes'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [resume_service_1.ResumeService,
        terminus_1.HealthCheckService])
], ResumeController);
//# sourceMappingURL=resume.controller.js.map