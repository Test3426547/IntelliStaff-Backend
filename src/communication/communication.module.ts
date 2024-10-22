import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommunicationService } from './communication.service';
import { CommunicationController } from './communication.controller';
import { TerminusModule } from '@nestjs/terminus';
import { Twilio } from 'twilio';

@Module({
  imports: [ConfigModule, TerminusModule],
  providers: [
    CommunicationService,
    {
      provide: 'TWILIO_CLIENT',
      useFactory: (configService: ConfigService) => {
        const accountSid = configService.get<string>('TWILIO_ACCOUNT_SID');
        const authToken = configService.get<string>('TWILIO_AUTH_TOKEN');
        return new Twilio(accountSid, authToken);
      },
      inject: [ConfigService],
    },
  ],
  controllers: [CommunicationController],
  exports: [CommunicationService],
})
export class CommunicationModule {}
