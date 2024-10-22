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
exports.IntegrationController = void 0;
const common_1 = require("@nestjs/common");
const integration_service_1 = require("./integration.service");
const auth_guard_1 = require("../user-management/auth.guard");
const swagger_1 = require("@nestjs/swagger");
let IntegrationController = class IntegrationController {
    constructor(integrationService) {
        this.integrationService = integrationService;
    }
    async getExternalData(resourceId) {
        return this.integrationService.getExternalData(resourceId);
    }
    async createExternalResource(data) {
        return this.integrationService.createExternalResource(data);
    }
    async updateExternalResource(resourceId, data) {
        return this.integrationService.updateExternalResource(resourceId, data);
    }
    async deleteExternalResource(resourceId) {
        return this.integrationService.deleteExternalResource(resourceId);
    }
};
exports.IntegrationController = IntegrationController;
__decorate([
    (0, common_1.Get)(':resourceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get external data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'External data retrieved successfully' }),
    __param(0, (0, common_1.Param)('resourceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "getExternalData", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create external resource' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'External resource created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "createExternalResource", null);
__decorate([
    (0, common_1.Put)(':resourceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update external resource' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'External resource updated successfully' }),
    __param(0, (0, common_1.Param)('resourceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "updateExternalResource", null);
__decorate([
    (0, common_1.Delete)(':resourceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete external resource' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'External resource deleted successfully' }),
    __param(0, (0, common_1.Param)('resourceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IntegrationController.prototype, "deleteExternalResource", null);
exports.IntegrationController = IntegrationController = __decorate([
    (0, swagger_1.ApiTags)('integration'),
    (0, common_1.Controller)('integration'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [integration_service_1.IntegrationService])
], IntegrationController);
//# sourceMappingURL=integration.controller.js.map