import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventService } from './event.service';

@Injectable()
export class EventSubscriberService implements OnModuleInit {
  constructor(private readonly eventService: EventService) {}

  onModuleInit() {
    this.subscribeToEvents();
  }

  private subscribeToEvents() {
    this.eventService.subscribe('test-event').subscribe({
      next: (data) => console.log('Received event:', data),
      error: (error) => console.error('Error receiving event:', error),
    });
  }

  async handleEvent(eventType: string, handler: (data: any) => Promise<void>): Promise<void> {
    await this.eventService.handleIncomingMessage(eventType, handler);
  }
}
