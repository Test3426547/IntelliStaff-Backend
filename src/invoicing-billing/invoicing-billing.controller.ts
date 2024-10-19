import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { InvoicingBillingService } from './invoicing-billing.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('invoicing-billing')
@Controller('invoicing-billing')
export class InvoicingBillingController {
  constructor(private readonly invoicingBillingService: InvoicingBillingService) {}

  @Post('generate-invoice')
  @ApiOperation({ summary: 'Generate a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice generated successfully' })
  async generateInvoice(
    @Body('userId') userId: string,
    @Body('amount') amount: number,
    @Body('description') description: string,
  ) {
    const invoice = await this.invoicingBillingService.generateInvoice(userId, amount, description);
    return { message: 'Invoice generated successfully', invoice };
  }

  @Post('process-payment')
  @ApiOperation({ summary: 'Process payment for an invoice' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  async processPayment(
    @Body('invoiceId') invoiceId: string,
    @Body('paymentMethod') paymentMethod: string,
  ) {
    const updatedInvoice = await this.invoicingBillingService.processPayment(invoiceId, paymentMethod);
    return { message: 'Payment processed successfully', invoice: updatedInvoice };
  }

  @Get('financial-report')
  @ApiOperation({ summary: 'Get financial report' })
  @ApiResponse({ status: 200, description: 'Financial report generated successfully' })
  async getFinancialReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const report = await this.invoicingBillingService.getFinancialReport(startDate, endDate);
    return { message: 'Financial report generated successfully', report };
  }
}
