import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventService } from './event.service';
import { EventPublisherService } from './event-publisher.service';
import { EventSubscriberService } from './event-subscriber.service';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'RABBIT_MQ_CLIENT',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');
          if (!rabbitmqUrl) {
            throw new Error('RABBITMQ_URL is not defined in the environment');
          }
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmqUrl],
              queue: 'main_queue',
              queueOptions: {
                durable: false
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [EventService, EventPublisherService, EventSubscriberService],
  exports: [EventService, EventPublisherService, EventSubscriberService],
})
export class EventModule {}
