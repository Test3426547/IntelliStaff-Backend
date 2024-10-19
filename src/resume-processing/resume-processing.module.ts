import { Module } from '@nestjs/common';
import { ResumeProcessingService } from './resume-processing.service';
import { ResumeProcessingController } from './resume-processing.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [ResumeProcessingService],
  controllers: [ResumeProcessingController],
  exports: [ResumeProcessingService],
})
export class ResumeProcessingModule {}
