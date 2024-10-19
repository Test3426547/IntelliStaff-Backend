import { Test, TestingModule } from '@nestjs/testing';
import { EventModule } from './event.module';
import { EventPublisherService } from './event-publisher.service';
import { EventSubscriberService } from './event-subscriber.service';

describe('Event-Driven Communication', () => {
  let eventPublisherService: EventPublisherService;
  let eventSubscriberService: EventSubscriberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventModule],
    }).compile();

    eventPublisherService = module.get<EventPublisherService>(EventPublisherService);
    eventSubscriberService = module.get<EventSubscriberService>(EventSubscriberService);
  });

  it('should publish and receive an event', (done) => {
    const testEvent = 'test-event';
    const testData = { message: 'Hello, Event-Driven World!' };

    eventSubscriberService.handleEvent(testEvent, async (data) => {
      expect(data).toEqual(testData);
      done();
    });

    eventPublisherService.publishEvent(testEvent, testData);
  });
});
