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
exports.MlModelManagementController = void 0;
const common_1 = require("@nestjs/common");
const ml_model_management_service_1 = require("./ml-model-management.service");
const auth_guard_1 = require("../user-management/auth.guard");
const swagger_1 = require("@nestjs/swagger");
const terminus_1 = require("@nestjs/terminus");
let MlModelManagementController = class MlModelManagementController {
    constructor(mlModelManagementService, health) {
        this.mlModelManagementService = mlModelManagementService;
        this.health = health;
    }
    async storeModel(modelData) {
        return this.mlModelManagementService.storeModel(modelData.name, modelData.version, modelData.data);
    }
    async retrieveModel(id) {
        return this.mlModelManagementService.retrieveModel(id);
    }
    async updateModel(id, updateData) {
        await this.mlModelManagementService.updateModel(id, updateData);
        return { message: 'Model updated successfully' };
    }
    async deleteModel(id) {
        await this.mlModelManagementService.deleteModel(id);
        return { message: 'Model deleted successfully' };
    }
    async runInference(id, inputData) {
        return this.mlModelManagementService.runInference(id, inputData);
    }
    async runHuggingFaceInference(modelName, inputData) {
        return this.mlModelManagementService.runHuggingFaceInference(modelName, inputData);
    }
    async monitorModelPerformance(id, metrics) {
        await this.mlModelManagementService.monitorModelPerformance(id, metrics);
        return { message: 'Performance metrics stored successfully' };
    }
    async getModelPerformanceHistory(id) {
        return this.mlModelManagementService.getModelPerformanceHistory(id);
    }
    async runABTest(testData) {
        return this.mlModelManagementService.runABTest(testData.modelAId, testData.modelBId, testData.testData);
    }
    async getABTestHistory() {
        return this.mlModelManagementService.getABTestHistory();
    }
    async compareModelVersions(id1, id2) {
        return this.mlModelManagementService.compareModelVersions(id1, id2);
    }
    async checkHealth() {
        return this.health.check([
            () => this.mlModelManagementService.checkHealth(),
        ]);
    }
};
exports.MlModelManagementController = MlModelManagementController;
__decorate([
    (0, common_1.Post)('store'),
    (0, swagger_1.ApiOperation)({ summary: 'Store a new ML model' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Model stored successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MlModelManagementController.prototype, "storeModel", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve an ML model' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Model retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MlModelManagementController.prototype, "retrieveModel", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an ML model' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Model updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MlModelManagementController.prototype, "updateModel", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an ML model' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Model deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MlModelManagementController.prototype, "deleteModel", null);
__decorate([
    (0, common_1.Post)('inference/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Run inference on an ML model' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inference completed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MlModelManagementController.prototype, "runInference", null);
__decorate([
    (0, common_1.Post)('huggingface-inference/:modelName'),
    (0, swagger_1.ApiOperation)({ summary: 'Run inference on a HuggingFace model' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'HuggingFace inference completed successfully' }),
    __param(0, (0, common_1.Param)('modelName')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MlModelManagementController.prototype, "runHuggingFaceInference", null);
__decorate([
    (0, common_1.Post)('monitor-performance/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Monitor model performance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Performance metrics stored successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MlModelManagementController.prototype, "monitorModelPerformance", null);
__decorate([
    (0, common_1.Get)('performance-history/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get model performance history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Performance history retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MlModelManagementController.prototype, "getModelPerformanceHistory", null);
__decorate([
    (0, common_1.Post)('ab-test'),
    (0, swagger_1.ApiOperation)({ summary: 'Run A/B test on two models' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'A/B test completed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MlModelManagementController.prototype, "runABTest", null);
__decorate([
    (0, common_1.Get)('ab-test-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get A/B test history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'A/B test history retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MlModelManagementController.prototype, "getABTestHistory", null);
__decorate([
    (0, common_1.Get)('compare-versions/:id1/:id2'),
    (0, swagger_1.ApiOperation)({ summary: 'Compare two model versions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Model versions compared successfully' }),
    __param(0, (0, common_1.Param)('id1')),
    __param(1, (0, common_1.Param)('id2')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MlModelManagementController.prototype, "compareModelVersions", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check the health of the ML Model Management service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MlModelManagementController.prototype, "checkHealth", null);
exports.MlModelManagementController = MlModelManagementController = __decorate([
    (0, swagger_1.ApiTags)('ml-model-management'),
    (0, common_1.Controller)('ml-model-management'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [ml_model_management_service_1.MlModelManagementService,
        terminus_1.HealthCheckService])
], MlModelManagementController);
//# sourceMappingURL=ml-model-management.controller.js.map