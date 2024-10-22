"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRelistingModule = void 0;
const common_1 = require("@nestjs/common");
const job_relisting_service_1 = require("./job-relisting.service");
const job_relisting_controller_1 = require("./job-relisting.controller");
const platform_integration_service_1 = require("./platform-integration.service");
const config_1 = require("@nestjs/config");
let JobRelistingModule = class JobRelistingModule {
};
exports.JobRelistingModule = JobRelistingModule;
exports.JobRelistingModule = JobRelistingModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [job_relisting_service_1.JobRelistingService, platform_integration_service_1.PlatformIntegrationService],
        controllers: [job_relisting_controller_1.JobRelistingController],
        exports: [job_relisting_service_1.JobRelistingService],
    })
], JobRelistingModule);
//# sourceMappingURL=job-relisting.module.js.map