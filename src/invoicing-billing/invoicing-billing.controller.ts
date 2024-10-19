import { Controller, Post, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InvoicingBillingService } from './invoicing-billing.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@ApiTags('invoicing-billing')
@Controller('invoicing-billing')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class InvoicingBillingController {
  constructor(
    private readonly invoicingBillingService: InvoicingBillingService,
    private health: HealthCheckService
  ) {}

  @Post('create-invoice')
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  async createInvoice(@Body() invoiceData: { userId: string; amount: number; description: string }) {
    return this.invoicingBillingService.createInvoice(invoiceData.userId, invoiceData.amount, invoiceData.description);
  }

  @Get('invoices/:userId')
  @ApiOperation({ summary: 'Get invoices for a user' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getInvoices(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.invoicingBillingService.getInvoices(userId, page, limit);
  }

  @Get('invoice/:id')
  @ApiOperation({ summary: 'Get a specific invoice' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async getInvoice(@Param('id') id: string) {
    return this.invoicingBillingService.getInvoiceById(id);
  }

  @Post('process-payment/:invoiceId')
  @ApiOperation({ summary: 'Process payment for an invoice' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  async processPayment(@Param('invoiceId') invoiceId: string) {
    return this.invoicingBillingService.processPayment(invoiceId);
  }

  @Put('cancel-invoice/:id')
  @ApiOperation({ summary: 'Cancel an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel a paid invoice' })
  async cancelInvoice(@Param('id') id: string) {
    await this.invoicingBillingService.cancelInvoice(id);
    return { message: 'Invoice cancelled successfully' };
  }

  @Get('financial-report')
  @ApiOperation({ summary: 'Generate financial report' })
  @ApiResponse({ status: 200, description: 'Financial report generated successfully' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  async generateFinancialReport(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.invoicingBillingService.generateFinancialReport(new Date(startDate), new Date(endDate));
  }

  @Get('health')
  @HealthCheck()
  @ApiOperation({ summary: 'Check the health of the Invoicing and Billing service' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async checkHealth() {
    return this.health.check([
      () => this.invoicingBillingService.checkHealth(),
    ]);
  }
}
