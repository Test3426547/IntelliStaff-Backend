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
exports.DataStorageController = void 0;
const common_1 = require("@nestjs/common");
const data_storage_service_1 = require("./data-storage.service");
const auth_guard_1 = require("../user-management/auth.guard");
const swagger_1 = require("@nestjs/swagger");
let DataStorageController = class DataStorageController {
    constructor(dataStorageService) {
        this.dataStorageService = dataStorageService;
    }
    async createEntity(entityName, data) {
        return this.dataStorageService.createEntity(entityName, data);
    }
    async findEntity(entityName, id) {
        return this.dataStorageService.findEntity(entityName, id);
    }
    async findEntities(entityName, options) {
        return this.dataStorageService.findEntities(entityName, options);
    }
    async updateEntity(entityName, id, data) {
        return this.dataStorageService.updateEntity(entityName, id, data);
    }
    async deleteEntity(entityName, id) {
        await this.dataStorageService.deleteEntity(entityName, id);
        return { message: 'Entity deleted successfully' };
    }
    async executeQuery(queryData) {
        return this.dataStorageService.executeQuery(queryData.query, queryData.parameters);
    }
    async getTableNames() {
        return this.dataStorageService.getTableNames();
    }
    async createBackup() {
        const backupPath = await this.dataStorageService.backupDatabase();
        return { message: 'Database backup created successfully', backupPath };
    }
    async restoreBackup(backupPath) {
        await this.dataStorageService.restoreDatabase(backupPath);
        return { message: 'Database restored successfully' };
    }
};
exports.DataStorageController = DataStorageController;
__decorate([
    (0, common_1.Post)('entities/:entity'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new entity' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Entity created successfully' }),
    __param(0, (0, common_1.Param)('entity')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DataStorageController.prototype, "createEntity", null);
__decorate([
    (0, common_1.Get)('entities/:entity/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Find an entity by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Entity found successfully' }),
    __param(0, (0, common_1.Param)('entity')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DataStorageController.prototype, "findEntity", null);
__decorate([
    (0, common_1.Get)('entities/:entity'),
    (0, swagger_1.ApiOperation)({ summary: 'Find entities with options' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Entities found successfully' }),
    __param(0, (0, common_1.Param)('entity')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DataStorageController.prototype, "findEntities", null);
__decorate([
    (0, common_1.Put)('entities/:entity/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an entity' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Entity updated successfully' }),
    __param(0, (0, common_1.Param)('entity')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DataStorageController.prototype, "updateEntity", null);
__decorate([
    (0, common_1.Delete)('entities/:entity/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an entity' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Entity deleted successfully' }),
    __param(0, (0, common_1.Param)('entity')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DataStorageController.prototype, "deleteEntity", null);
__decorate([
    (0, common_1.Post)('query'),
    (0, swagger_1.ApiOperation)({ summary: 'Execute a custom query' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Query executed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DataStorageController.prototype, "executeQuery", null);
__decorate([
    (0, common_1.Get)('tables'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all table names' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Table names retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DataStorageController.prototype, "getTableNames", null);
__decorate([
    (0, common_1.Post)('backup'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a database backup' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Database backup created successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DataStorageController.prototype, "createBackup", null);
__decorate([
    (0, common_1.Post)('restore'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore database from a backup' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Database restored successfully' }),
    __param(0, (0, common_1.Body)('backupPath')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DataStorageController.prototype, "restoreBackup", null);
exports.DataStorageController = DataStorageController = __decorate([
    (0, swagger_1.ApiTags)('data-storage'),
    (0, common_1.Controller)('data-storage'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [data_storage_service_1.DataStorageService])
], DataStorageController);
//# sourceMappingURL=data-storage.controller.js.map