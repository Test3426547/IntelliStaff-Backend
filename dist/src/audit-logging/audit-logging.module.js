"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLoggingModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const audit_logging_service_1 = require("./audit-logging.service");
const audit_logging_controller_1 = require("./audit-logging.controller");
const terminus_1 = require("@nestjs/terminus");
let AuditLoggingModule = class AuditLoggingModule {
};
exports.AuditLoggingModule = AuditLoggingModule;
exports.AuditLoggingModule = AuditLoggingModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, terminus_1.TerminusModule],
        providers: [audit_logging_service_1.AuditLoggingService],
        controllers: [audit_logging_controller_1.AuditLoggingController],
        exports: [audit_logging_service_1.AuditLoggingService],
    })
], AuditLoggingModule);
//# sourceMappingURL=audit-logging.module.js.map