"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobIngestionModule = void 0;
const common_1 = require("@nestjs/common");
const job_ingestion_service_1 = require("./job-ingestion.service");
const job_ingestion_controller_1 = require("./job-ingestion.controller");
const web_scraper_service_1 = require("./web-scraper.service");
const job_processing_module_1 = require("../job-processing/job-processing.module");
let JobIngestionModule = class JobIngestionModule {
};
exports.JobIngestionModule = JobIngestionModule;
exports.JobIngestionModule = JobIngestionModule = __decorate([
    (0, common_1.Module)({
        imports: [job_processing_module_1.JobProcessingModule],
        providers: [job_ingestion_service_1.JobIngestionService, web_scraper_service_1.WebScraperService],
        controllers: [job_ingestion_controller_1.JobIngestionController],
        exports: [job_ingestion_service_1.JobIngestionService],
    })
], JobIngestionModule);
//# sourceMappingURL=job-ingestion.module.js.map