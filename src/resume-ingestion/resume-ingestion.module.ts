import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ResumeIngestionService } from './resume-ingestion.service';
import { ResumeIngestionController } from './resume-ingestion.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [ConfigModule, TerminusModule],
  providers: [ResumeIngestionService],
  controllers: [ResumeIngestionController],
  exports: [ResumeIngestionService],
})
export class ResumeIngestionModule {}
