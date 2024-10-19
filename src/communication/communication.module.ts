import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommunicationService } from './communication.service';
import { CommunicationController } from './communication.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [ConfigModule, TerminusModule],
  providers: [CommunicationService],
  controllers: [CommunicationController],
  exports: [CommunicationService],
})
export class CommunicationModule {}
