import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [ConfigModule, TerminusModule],
  providers: [SecurityService],
  controllers: [SecurityController],
  exports: [SecurityService],
})
export class SecurityModule {}
