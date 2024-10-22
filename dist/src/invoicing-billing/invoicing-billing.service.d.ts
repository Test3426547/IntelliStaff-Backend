import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
export declare class InvoicingBillingService extends HealthIndicator {
    private configService;
    private supabase;
    private readonly logger;
    private stripe;
    constructor(configService: ConfigService);
    checkHealth(): Promise<HealthIndicatorResult>;
    createInvoice(userId: string, amount: number, description: string): Promise<any>;
    getInvoices(userId: string, page?: number, limit?: number): Promise<{
        invoices: any[];
        total: number;
    }>;
    getInvoiceById(invoiceId: string): Promise<any>;
    processPayment(invoiceId: string): Promise<any>;
    cancelInvoice(invoiceId: string): Promise<void>;
    generateFinancialReport(startDate: Date, endDate: Date): Promise<any>;
}
