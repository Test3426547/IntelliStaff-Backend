"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const event_module_1 = require("./event.module");
const event_publisher_service_1 = require("./event-publisher.service");
const event_subscriber_service_1 = require("./event-subscriber.service");
describe('Event-Driven Communication', () => {
    let eventPublisherService;
    let eventSubscriberService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            imports: [event_module_1.EventModule],
        }).compile();
        eventPublisherService = module.get(event_publisher_service_1.EventPublisherService);
        eventSubscriberService = module.get(event_subscriber_service_1.EventSubscriberService);
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
//# sourceMappingURL=event-communication.spec.js.map