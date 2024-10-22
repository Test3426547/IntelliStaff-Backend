import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
export declare class EventService {
    private client;
    private readonly logger;
    constructor(client: ClientProxy);
    publish(eventType: string, data: any, retries?: number): Promise<void>;
    subscribe(eventType: string): Observable<any>;
    handleIncomingMessage(eventType: string, handler: (data: any) => Promise<void>): Promise<void>;
}
