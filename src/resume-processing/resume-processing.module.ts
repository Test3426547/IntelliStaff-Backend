import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ResumeProcessingService } from './resume-processing.service';
import { ResumeProcessingController } from './resume-processing.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [ConfigModule, TerminusModule],
  providers: [ResumeProcessingService],
  controllers: [ResumeProcessingController],
  exports: [ResumeProcessingService],
})
export class ResumeProcessingModule {}
