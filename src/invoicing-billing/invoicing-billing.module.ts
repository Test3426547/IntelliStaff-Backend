import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InvoicingBillingService } from './invoicing-billing.service';
import { InvoicingBillingController } from './invoicing-billing.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [ConfigModule, TerminusModule],
  providers: [InvoicingBillingService],
  controllers: [InvoicingBillingController],
  exports: [InvoicingBillingService],
})
export class InvoicingBillingModule {}
