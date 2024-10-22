"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resume_service_1 = require("./resume.service");
const resume_controller_1 = require("./resume.controller");
const terminus_1 = require("@nestjs/terminus");
let ResumeModule = class ResumeModule {
};
exports.ResumeModule = ResumeModule;
exports.ResumeModule = ResumeModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, terminus_1.TerminusModule],
        providers: [resume_service_1.ResumeService],
        controllers: [resume_controller_1.ResumeController],
        exports: [resume_service_1.ResumeService],
    })
], ResumeModule);
//# sourceMappingURL=resume.module.js.map