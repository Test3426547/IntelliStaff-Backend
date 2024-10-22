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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicingBillingController = void 0;
const common_1 = require("@nestjs/common");
const invoicing_billing_service_1 = require("./invoicing-billing.service");
const auth_guard_1 = require("../user-management/auth.guard");
const swagger_1 = require("@nestjs/swagger");
const terminus_1 = require("@nestjs/terminus");
let InvoicingBillingController = class InvoicingBillingController {
    constructor(invoicingBillingService, health) {
        this.invoicingBillingService = invoicingBillingService;
        this.health = health;
    }
    async createInvoice(invoiceData) {
        return this.invoicingBillingService.createInvoice(invoiceData.userId, invoiceData.amount, invoiceData.description);
    }
    async getInvoices(userId, page = 1, limit = 10) {
        return this.invoicingBillingService.getInvoices(userId, page, limit);
    }
    async getInvoice(id) {
        return this.invoicingBillingService.getInvoiceById(id);
    }
    async processPayment(invoiceId) {
        return this.invoicingBillingService.processPayment(invoiceId);
    }
    async cancelInvoice(id) {
        await this.invoicingBillingService.cancelInvoice(id);
        return { message: 'Invoice cancelled successfully' };
    }
    async generateFinancialReport(startDate, endDate) {
        return this.invoicingBillingService.generateFinancialReport(new Date(startDate), new Date(endDate));
    }
    async checkHealth() {
        return this.health.check([
            () => this.invoicingBillingService.checkHealth(),
        ]);
    }
};
exports.InvoicingBillingController = InvoicingBillingController;
__decorate([
    (0, common_1.Post)('create-invoice'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new invoice' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Invoice created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoicingBillingController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Get)('invoices/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get invoices for a user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Invoices retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], InvoicingBillingController.prototype, "getInvoices", null);
__decorate([
    (0, common_1.Get)('invoice/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific invoice' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Invoice retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invoice not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoicingBillingController.prototype, "getInvoice", null);
__decorate([
    (0, common_1.Post)('process-payment/:invoiceId'),
    (0, swagger_1.ApiOperation)({ summary: 'Process payment for an invoice' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment processed successfully' }),
    __param(0, (0, common_1.Param)('invoiceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoicingBillingController.prototype, "processPayment", null);
__decorate([
    (0, common_1.Put)('cancel-invoice/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel an invoice' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Invoice cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot cancel a paid invoice' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoicingBillingController.prototype, "cancelInvoice", null);
__decorate([
    (0, common_1.Get)('financial-report'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate financial report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Financial report generated successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true, type: String }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InvoicingBillingController.prototype, "generateFinancialReport", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check the health of the Invoicing and Billing service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Service is healthy' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvoicingBillingController.prototype, "checkHealth", null);
exports.InvoicingBillingController = InvoicingBillingController = __decorate([
    (0, swagger_1.ApiTags)('invoicing-billing'),
    (0, common_1.Controller)('invoicing-billing'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [invoicing_billing_service_1.InvoicingBillingService,
        terminus_1.HealthCheckService])
], InvoicingBillingController);
//# sourceMappingURL=invoicing-billing.controller.js.map