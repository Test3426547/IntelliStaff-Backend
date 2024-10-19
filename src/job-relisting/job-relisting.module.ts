import { Module } from '@nestjs/common';
import { JobRelistingService } from './job-relisting.service';
import { JobRelistingController } from './job-relisting.controller';
import { PlatformIntegrationService } from './platform-integration.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [JobRelistingService, PlatformIntegrationService],
  controllers: [JobRelistingController],
  exports: [JobRelistingService],
})
export class JobRelistingModule {}
