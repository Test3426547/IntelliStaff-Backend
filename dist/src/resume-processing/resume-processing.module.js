"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeProcessingModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resume_processing_service_1 = require("./resume-processing.service");
const resume_processing_controller_1 = require("./resume-processing.controller");
const terminus_1 = require("@nestjs/terminus");
let ResumeProcessingModule = class ResumeProcessingModule {
};
exports.ResumeProcessingModule = ResumeProcessingModule;
exports.ResumeProcessingModule = ResumeProcessingModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, terminus_1.TerminusModule],
        providers: [resume_processing_service_1.ResumeProcessingService],
        controllers: [resume_processing_controller_1.ResumeProcessingController],
        exports: [resume_processing_service_1.ResumeProcessingService],
    })
], ResumeProcessingModule);
//# sourceMappingURL=resume-processing.module.js.map