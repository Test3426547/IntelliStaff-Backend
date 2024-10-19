import { Module } from '@nestjs/common';
import { ApplicantMatchingService } from './applicant-matching.service';
import { ApplicantMatchingController } from './applicant-matching.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [ApplicantMatchingService],
  controllers: [ApplicantMatchingController],
  exports: [ApplicantMatchingService],
})
export class ApplicantMatchingModule {}
