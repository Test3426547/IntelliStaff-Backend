import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApplicantMatchingService } from './applicant-matching.service';
import { ApplicantMatchingController } from './applicant-matching.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [ConfigModule, TerminusModule],
  providers: [ApplicantMatchingService],
  controllers: [ApplicantMatchingController],
  exports: [ApplicantMatchingService],
})
export class ApplicantMatchingModule {}
