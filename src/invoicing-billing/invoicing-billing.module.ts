import { Module } from '@nestjs/common';
import { InvoicingBillingService } from './invoicing-billing.service';
import { InvoicingBillingController } from './invoicing-billing.controller';

@Module({
  providers: [InvoicingBillingService],
  controllers: [InvoicingBillingController],
  exports: [InvoicingBillingService],
})
export class InvoicingBillingModule {}
