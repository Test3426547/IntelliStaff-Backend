import { Module } from '@nestjs/common';
import { ResumeIngestionService } from './resume-ingestion.service';
import { ResumeIngestionController } from './resume-ingestion.controller';
import { EmailParserService } from './email-parser.service';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
  providers: [ResumeIngestionService, EmailParserService],
  controllers: [ResumeIngestionController],
  exports: [ResumeIngestionService],
})
export class ResumeIngestionModule {}
