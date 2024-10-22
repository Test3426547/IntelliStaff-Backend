import { OnModuleInit } from '@nestjs/common';
import { EventService } from './event.service';
export declare class EventSubscriberService implements OnModuleInit {
    private readonly eventService;
    constructor(eventService: EventService);
    onModuleInit(): void;
    private subscribeToEvents;
    handleEvent(eventType: string, handler: (data: any) => Promise<void>): Promise<void>;
}
