import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [ConfigModule, TerminusModule],
  providers: [ResumeService],
  controllers: [ResumeController],
  exports: [ResumeService],
})
export class ResumeModule {}
