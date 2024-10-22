"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var InvoicingBillingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicingBillingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const terminus_1 = require("@nestjs/terminus");
const Stripe = __importStar(require("stripe"));
let InvoicingBillingService = InvoicingBillingService_1 = class InvoicingBillingService extends terminus_1.HealthIndicator {
    constructor(configService) {
        super();
        this.configService = configService;
        this.logger = new common_1.Logger(InvoicingBillingService_1.name);
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
        this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2023-10-16',
        });
    }
    async checkHealth() {
        try {
            const { data, error } = await this.supabase.from('invoices').select('id').limit(1);
            if (error)
                throw error;
            return this.getStatus('invoicing_billing_db', true, { message: 'Invoicing and Billing Service DB is healthy' });
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error.message}`);
            throw new terminus_1.HealthCheckError('Invoicing and Billing Service DB check failed', error);
        }
    }
    async createInvoice(userId, amount, description) {
        try {
            const { data: user, error: userError } = await this.supabase
                .from('users')
                .select('stripe_customer_id')
                .eq('id', userId)
                .single();
            if (userError)
                throw new Error(`Failed to fetch user: ${userError.message}`);
            let stripeCustomerId = user.stripe_customer_id;
            if (!stripeCustomerId) {
                const newCustomer = await this.stripe.customers.create({
                    metadata: { userId },
                });
                stripeCustomerId = newCustomer.id;
                await this.supabase
                    .from('users')
                    .update({ stripe_customer_id: stripeCustomerId })
                    .eq('id', userId);
            }
            const invoice = await this.stripe.invoices.create({
                customer: stripeCustomerId,
                collection_method: 'send_invoice',
                days_until_due: 30,
            });
            await this.stripe.invoiceItems.create({
                customer: stripeCustomerId,
                amount: amount * 100,
                currency: 'usd',
                invoice: invoice.id,
                description,
            });
            const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id);
            const { data, error } = await this.supabase.from('invoices').insert({
                user_id: userId,
                stripe_invoice_id: finalizedInvoice.id,
                amount,
                description,
                status: finalizedInvoice.status,
                due_date: new Date(finalizedInvoice.due_date * 1000),
            }).select().single();
            if (error)
                throw new Error(`Failed to create invoice record: ${error.message}`);
            return data;
        }
        catch (error) {
            this.logger.error(`Error creating invoice: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to create invoice');
        }
    }
    async getInvoices(userId, page = 1, limit = 10) {
        try {
            const { data, error, count } = await this.supabase
                .from('invoices')
                .select('*', { count: 'exact' })
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1);
            if (error)
                throw new Error(`Failed to fetch invoices: ${error.message}`);
            return { invoices: data, total: count };
        }
        catch (error) {
            this.logger.error(`Error fetching invoices: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to fetch invoices');
        }
    }
    async getInvoiceById(invoiceId) {
        try {
            const { data, error } = await this.supabase
                .from('invoices')
                .select('*')
                .eq('id', invoiceId)
                .single();
            if (error)
                throw new Error(`Failed to fetch invoice: ${error.message}`);
            if (!data)
                throw new common_1.NotFoundException(`Invoice with ID ${invoiceId} not found`);
            return data;
        }
        catch (error) {
            this.logger.error(`Error fetching invoice: ${error.message}`);
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException('Failed to fetch invoice');
        }
    }
    async processPayment(invoiceId) {
        try {
            const invoice = await this.getInvoiceById(invoiceId);
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: invoice.amount * 100,
                currency: 'usd',
                customer: invoice.stripe_customer_id,
                payment_method_types: ['card'],
                description: invoice.description,
                metadata: { invoiceId },
            });
            const { error } = await this.supabase
                .from('invoices')
                .update({ payment_intent_id: paymentIntent.id, status: 'pending' })
                .eq('id', invoiceId);
            if (error)
                throw new Error(`Failed to update invoice: ${error.message}`);
            return { clientSecret: paymentIntent.client_secret };
        }
        catch (error) {
            this.logger.error(`Error processing payment: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to process payment');
        }
    }
    async cancelInvoice(invoiceId) {
        try {
            const invoice = await this.getInvoiceById(invoiceId);
            if (invoice.status === 'paid') {
                throw new Error('Cannot cancel a paid invoice');
            }
            await this.stripe.invoices.voidInvoice(invoice.stripe_invoice_id);
            const { error } = await this.supabase
                .from('invoices')
                .update({ status: 'cancelled' })
                .eq('id', invoiceId);
            if (error)
                throw new Error(`Failed to update invoice status: ${error.message}`);
        }
        catch (error) {
            this.logger.error(`Error cancelling invoice: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to cancel invoice');
        }
    }
    async generateFinancialReport(startDate, endDate) {
        try {
            const { data, error } = await this.supabase
                .from('invoices')
                .select('*')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString());
            if (error)
                throw new Error(`Failed to fetch invoice data: ${error.message}`);
            const totalRevenue = data.reduce((sum, invoice) => sum + invoice.amount, 0);
            const paidInvoices = data.filter(invoice => invoice.status === 'paid');
            const unpaidInvoices = data.filter(invoice => invoice.status !== 'paid');
            return {
                totalRevenue,
                totalInvoices: data.length,
                paidInvoices: paidInvoices.length,
                unpaidInvoices: unpaidInvoices.length,
                averageInvoiceAmount: totalRevenue / data.length,
                startDate,
                endDate,
            };
        }
        catch (error) {
            this.logger.error(`Error generating financial report: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to generate financial report');
        }
    }
};
exports.InvoicingBillingService = InvoicingBillingService;
exports.InvoicingBillingService = InvoicingBillingService = InvoicingBillingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], InvoicingBillingService);
//# sourceMappingURL=invoicing-billing.service.js.map