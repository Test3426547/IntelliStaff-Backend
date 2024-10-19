import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class InvoicingBillingService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
  }

  async generateInvoice(userId: string, amount: number, description: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('invoices')
      .insert({
        user_id: userId,
        amount,
        description,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to generate invoice: ${error.message}`);
    return data;
  }

  async processPayment(invoiceId: string, paymentMethod: string): Promise<any> {
    // In a real-world scenario, you would integrate with a payment gateway here
    const { data, error } = await this.supabase
      .from('invoices')
      .update({ status: 'paid', payment_method: paymentMethod, paid_at: new Date().toISOString() })
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) throw new Error(`Failed to process payment: ${error.message}`);
    return data;
  }

  async getFinancialReport(startDate: string, endDate: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw new Error(`Failed to generate financial report: ${error.message}`);

    const totalRevenue = data.reduce((sum, invoice) => sum + invoice.amount, 0);
    const paidInvoices = data.filter(invoice => invoice.status === 'paid').length;
    const pendingInvoices = data.filter(invoice => invoice.status === 'pending').length;

    return {
      totalRevenue,
      paidInvoices,
      pendingInvoices,
      invoices: data,
    };
  }
}
