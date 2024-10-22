import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class EventEmitterService {
    private eventEmitter;
    constructor(eventEmitter: EventEmitter2);
    emit(event: string, payload: any): void;
    on(event: string, listener: (...args: any[]) => void): void;
}
