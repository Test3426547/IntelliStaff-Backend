import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Observable, throwError, lastValueFrom, from } from 'rxjs';
import { catchError, retry, mergeMap } from 'rxjs/operators';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(@Inject('RABBIT_MQ_CLIENT') private client: ClientProxy) {}

  async publish(eventType: string, data: any, retries: number = 3): Promise<void> {
    try {
      await lastValueFrom(
        from(Array(retries).fill(0)).pipe(
          mergeMap(() => this.client.emit(eventType, data)),
          catchError((error, caught) => {
            if (caught.count < retries - 1) {
              this.logger.warn(`Failed to publish event: ${eventType}. Retrying...`);
              return caught;
            }
            this.logger.error(`Failed to publish event: ${eventType}`, error.stack);
            return throwError(() => new Error(`Failed to publish event after ${retries} retries: ${eventType}`));
          })
        )
      );
      this.logger.log(`Event published: ${eventType}`);
    } catch (error) {
      this.logger.error(`Failed to publish event: ${eventType}`, error.stack);
      throw error;
    }
  }

  subscribe(eventType: string): Observable<any> {
    this.logger.log(`Subscribing to event: ${eventType}`);
    return this.client.send(eventType, {}).pipe(
      catchError((error) => {
        this.logger.error(`Failed to subscribe to event: ${eventType}`, error.stack);
        return throwError(() => new Error(`Failed to subscribe to event: ${eventType}`));
      })
    );
  }

  async handleIncomingMessage(eventType: string, handler: (data: any) => Promise<void>): Promise<void> {
    this.client.send(eventType, {}).subscribe({
      next: async (data) => {
        try {
          await handler(data);
          this.logger.log(`Handled incoming message for event: ${eventType}`);
        } catch (error) {
          this.logger.error(`Error handling incoming message for event: ${eventType}`, error.stack);
        }
      },
      error: (error) => {
        this.logger.error(`Error receiving message for event: ${eventType}`, error.stack);
      }
    });
  }
}
