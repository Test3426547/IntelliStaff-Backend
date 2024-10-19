import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import * as Stripe from 'stripe';

@Injectable()
export class InvoicingBillingService extends HealthIndicator {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(InvoicingBillingService.name);
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    super();
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async checkHealth(): Promise<HealthIndicatorResult> {
    try {
      const { data, error } = await this.supabase.from('invoices').select('id').limit(1);
      if (error) throw error;
      return this.getStatus('invoicing_billing_db', true, { message: 'Invoicing and Billing Service DB is healthy' });
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      throw new HealthCheckError('Invoicing and Billing Service DB check failed', error);
    }
  }

  async createInvoice(userId: string, amount: number, description: string): Promise<any> {
    try {
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();

      if (userError) throw new Error(`Failed to fetch user: ${userError.message}`);

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
        amount: amount * 100, // Stripe uses cents
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

      if (error) throw new Error(`Failed to create invoice record: ${error.message}`);

      return data;
    } catch (error) {
      this.logger.error(`Error creating invoice: ${error.message}`);
      throw new InternalServerErrorException('Failed to create invoice');
    }
  }

  async getInvoices(userId: string, page: number = 1, limit: number = 10): Promise<{ invoices: any[], total: number }> {
    try {
      const { data, error, count } = await this.supabase
        .from('invoices')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw new Error(`Failed to fetch invoices: ${error.message}`);

      return { invoices: data, total: count };
    } catch (error) {
      this.logger.error(`Error fetching invoices: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch invoices');
    }
  }

  async getInvoiceById(invoiceId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (error) throw new Error(`Failed to fetch invoice: ${error.message}`);
      if (!data) throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);

      return data;
    } catch (error) {
      this.logger.error(`Error fetching invoice: ${error.message}`);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch invoice');
    }
  }

  async processPayment(invoiceId: string): Promise<any> {
    try {
      const invoice = await this.getInvoiceById(invoiceId);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: invoice.amount * 100, // Stripe uses cents
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

      if (error) throw new Error(`Failed to update invoice: ${error.message}`);

      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      this.logger.error(`Error processing payment: ${error.message}`);
      throw new InternalServerErrorException('Failed to process payment');
    }
  }

  async cancelInvoice(invoiceId: string): Promise<void> {
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

      if (error) throw new Error(`Failed to update invoice status: ${error.message}`);
    } catch (error) {
      this.logger.error(`Error cancelling invoice: ${error.message}`);
      throw new InternalServerErrorException('Failed to cancel invoice');
    }
  }

  async generateFinancialReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('invoices')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw new Error(`Failed to fetch invoice data: ${error.message}`);

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
    } catch (error) {
      this.logger.error(`Error generating financial report: ${error.message}`);
      throw new InternalServerErrorException('Failed to generate financial report');
    }
  }
}
