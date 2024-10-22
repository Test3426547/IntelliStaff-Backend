"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobProcessingModule = void 0;
const common_1 = require("@nestjs/common");
const job_processing_service_1 = require("./job-processing.service");
const job_processing_controller_1 = require("./job-processing.controller");
const keyword_optimizer_service_1 = require("./keyword-optimizer.service");
const config_1 = require("@nestjs/config");
let JobProcessingModule = class JobProcessingModule {
};
exports.JobProcessingModule = JobProcessingModule;
exports.JobProcessingModule = JobProcessingModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [job_processing_service_1.JobProcessingService, keyword_optimizer_service_1.KeywordOptimizerService],
        controllers: [job_processing_controller_1.JobProcessingController],
        exports: [job_processing_service_1.JobProcessingService],
    })
], JobProcessingModule);
//# sourceMappingURL=job-processing.module.js.map