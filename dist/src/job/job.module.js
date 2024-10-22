"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const job_service_1 = require("./job.service");
const job_controller_1 = require("./job.controller");
const job_processing_service_1 = require("./job-processing.service");
const job_ingestion_service_1 = require("./job-ingestion.service");
const job_ingestion_controller_1 = require("./job-ingestion.controller");
let JobModule = class JobModule {
};
exports.JobModule = JobModule;
exports.JobModule = JobModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [job_service_1.JobService, job_processing_service_1.JobProcessingService, job_ingestion_service_1.JobIngestionService],
        controllers: [job_controller_1.JobController, job_ingestion_controller_1.JobIngestionController],
        exports: [job_service_1.JobService, job_processing_service_1.JobProcessingService, job_ingestion_service_1.JobIngestionService],
    })
], JobModule);
//# sourceMappingURL=job.module.js.map