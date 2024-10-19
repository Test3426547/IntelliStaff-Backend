import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [ConfigModule, TerminusModule],
  providers: [JobService],
  controllers: [JobController],
  exports: [JobService],
})
export class JobModule {}
