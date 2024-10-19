import { Module } from '@nestjs/common';
import { JobProcessingService } from './job-processing.service';
import { JobProcessingController } from './job-processing.controller';
import { KeywordOptimizerService } from './keyword-optimizer.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [JobProcessingService, KeywordOptimizerService],
  controllers: [JobProcessingController],
  exports: [JobProcessingService],
})
export class JobProcessingModule {}
