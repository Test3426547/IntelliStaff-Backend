"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const user_management_module_1 = require("./user-management/user-management.module");
const job_module_1 = require("./job/job.module");
const resume_module_1 = require("./resume/resume.module");
const applicant_matching_module_1 = require("./applicant-matching/applicant-matching.module");
const communication_module_1 = require("./communication/communication.module");
const analytics_module_1 = require("./analytics/analytics.module");
const invoicing_billing_module_1 = require("./invoicing-billing/invoicing-billing.module");
const ml_model_management_module_1 = require("./ml-model-management/ml-model-management.module");
const notification_module_1 = require("./notification/notification.module");
const audit_logging_module_1 = require("./audit-logging/audit-logging.module");
const error_handling_monitoring_module_1 = require("./error-handling-monitoring/error-handling-monitoring.module");
const security_module_1 = require("./security/security.module");
const data_storage_module_1 = require("./data-storage/data-storage.module");
const api_gateway_module_1 = require("./api-gateway/api-gateway.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            user_management_module_1.UserManagementModule,
            job_module_1.JobModule,
            resume_module_1.ResumeModule,
            applicant_matching_module_1.ApplicantMatchingModule,
            communication_module_1.CommunicationModule,
            analytics_module_1.AnalyticsModule,
            invoicing_billing_module_1.InvoicingBillingModule,
            ml_model_management_module_1.MlModelManagementModule,
            notification_module_1.NotificationModule,
            audit_logging_module_1.AuditLoggingModule,
            error_handling_monitoring_module_1.ErrorHandlingMonitoringModule,
            security_module_1.SecurityModule,
            data_storage_module_1.DataStorageModule,
            api_gateway_module_1.ApiGatewayModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map