import { Injectable } from '@nestjs/common';
import { EventService } from './event.service';

@Injectable()
export class EventPublisherService {
  constructor(private readonly eventService: EventService) {}

  async publishEvent(eventType: string, data: any): Promise<void> {
    await this.eventService.publish(eventType, data);
  }
}
