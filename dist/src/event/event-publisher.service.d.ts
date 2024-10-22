import { EventService } from './event.service';
export declare class EventPublisherService {
    private readonly eventService;
    constructor(eventService: EventService);
    publishEvent(eventType: string, data: any): Promise<void>;
}
