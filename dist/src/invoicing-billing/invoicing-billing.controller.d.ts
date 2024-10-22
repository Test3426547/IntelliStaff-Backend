import { InvoicingBillingService } from './invoicing-billing.service';
import { HealthCheckService } from '@nestjs/terminus';
export declare class InvoicingBillingController {
    private readonly invoicingBillingService;
    private health;
    constructor(invoicingBillingService: InvoicingBillingService, health: HealthCheckService);
    createInvoice(invoiceData: {
        userId: string;
        amount: number;
        description: string;
    }): Promise<any>;
    getInvoices(userId: string, page?: number, limit?: number): Promise<{
        invoices: any[];
        total: number;
    }>;
    getInvoice(id: string): Promise<any>;
    processPayment(invoiceId: string): Promise<any>;
    cancelInvoice(id: string): Promise<{
        message: string;
    }>;
    generateFinancialReport(startDate: string, endDate: string): Promise<any>;
    checkHealth(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
