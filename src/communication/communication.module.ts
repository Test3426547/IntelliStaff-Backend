import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommunicationService } from './communication.service';
import { CommunicationController } from './communication.controller';
import { TerminusModule } from '@nestjs/terminus';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';
import * as twilio from 'twilio';
import * as Handlebars from 'handlebars';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule,
    TerminusModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    CommunicationService,
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: (configService: ConfigService) => {
        const firebaseConfig = {
          projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
          clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
          privateKey: configService.get<string>('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
        };
        return admin.initializeApp({ credential: admin.credential.cert(firebaseConfig) });
      },
      inject: [ConfigService],
    },
    {
      provide: 'SENDGRID',
      useFactory: (configService: ConfigService) => {
        sgMail.setApiKey(configService.get<string>('SENDGRID_API_KEY'));
        return sgMail;
      },
      inject: [ConfigService],
    },
    {
      provide: 'TWILIO',
      useFactory: (configService: ConfigService) => {
        const accountSid = configService.get<string>('TWILIO_ACCOUNT_SID');
        const authToken = configService.get<string>('TWILIO_AUTH_TOKEN');
        return twilio(accountSid, authToken);
      },
      inject: [ConfigService],
    },
    {
      provide: 'HANDLEBARS',
      useValue: Handlebars,
    },
  ],
  controllers: [CommunicationController],
  exports: [CommunicationService],
})
export class CommunicationModule {}
