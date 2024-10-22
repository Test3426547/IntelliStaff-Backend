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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MlModelManagementModule = void 0;
const common_1 = require("@nestjs/common");
const ml_model_management_service_1 = require("./ml-model-management.service");
const ml_model_management_controller_1 = require("./ml-model-management.controller");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
let MlModelManagementModule = class MlModelManagementModule {
    constructor(mlModelManagementService) {
        this.mlModelManagementService = mlModelManagementService;
        this.mlModelManagementService.startCacheCleanupInterval();
    }
};
exports.MlModelManagementModule = MlModelManagementModule;
exports.MlModelManagementModule = MlModelManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            schedule_1.ScheduleModule.forRoot(),
        ],
        providers: [ml_model_management_service_1.MlModelManagementService],
        controllers: [ml_model_management_controller_1.MlModelManagementController],
        exports: [ml_model_management_service_1.MlModelManagementService],
    }),
    __metadata("design:paramtypes", [ml_model_management_service_1.MlModelManagementService])
], MlModelManagementModule);
//# sourceMappingURL=ml-model-management.module.js.map