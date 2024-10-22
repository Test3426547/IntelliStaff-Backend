"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreModule = void 0;
const common_1 = require("@nestjs/common");
const configuration_module_1 = require("../config/configuration.module");
const common_module_1 = require("../common/common.module");
const database_module_1 = require("../database/database.module");
const user_management_module_1 = require("../user-management/user-management.module");
const security_module_1 = require("../security/security.module");
const audit_logging_module_1 = require("../audit-logging/audit-logging.module");
const error_handling_monitoring_module_1 = require("../error-handling-monitoring/error-handling-monitoring.module");
let CoreModule = class CoreModule {
};
exports.CoreModule = CoreModule;
exports.CoreModule = CoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            configuration_module_1.ConfigurationModule,
            common_module_1.CommonModule,
            database_module_1.DatabaseModule,
            user_management_module_1.UserManagementModule,
            security_module_1.SecurityModule,
            audit_logging_module_1.AuditLoggingModule,
            error_handling_monitoring_module_1.ErrorHandlingMonitoringModule,
        ],
        exports: [
            configuration_module_1.ConfigurationModule,
            common_module_1.CommonModule,
            database_module_1.DatabaseModule,
            user_management_module_1.UserManagementModule,
            security_module_1.SecurityModule,
            audit_logging_module_1.AuditLoggingModule,
            error_handling_monitoring_module_1.ErrorHandlingMonitoringModule,
        ],
    })
], CoreModule);
//# sourceMappingURL=core.module.js.map