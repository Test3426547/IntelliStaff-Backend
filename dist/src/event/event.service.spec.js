"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const event_service_1 = require("./event.service");
const rxjs_1 = require("rxjs");
describe('EventService', () => {
    let service;
    let clientProxyMock;
    beforeEach(async () => {
        clientProxyMock = {
            emit: jest.fn().mockReturnValue((0, rxjs_1.of)(undefined)),
            send: jest.fn().mockReturnValue((0, rxjs_1.of)({})),
            connect: jest.fn().mockResolvedValue(undefined),
            close: jest.fn(),
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                event_service_1.EventService,
                {
                    provide: 'RABBIT_MQ_CLIENT',
                    useValue: clientProxyMock,
                },
            ],
        }).compile();
        service = module.get(event_service_1.EventService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('publish', () => {
        it('should publish an event successfully', async () => {
            await service.publish('test-event', { data: 'test-data' });
            expect(clientProxyMock.emit).toHaveBeenCalledWith('test-event', { data: 'test-data' });
        });
        it('should retry publishing on failure', async () => {
            clientProxyMock.emit
                .mockReturnValueOnce((0, rxjs_1.throwError)(() => new Error('Publish failed')))
                .mockReturnValueOnce((0, rxjs_1.throwError)(() => new Error('Publish failed')))
                .mockReturnValueOnce((0, rxjs_1.of)(undefined));
            await service.publish('test-event', { data: 'test-data' }, 3);
            expect(clientProxyMock.emit).toHaveBeenCalledTimes(3);
        });
        it('should throw an error if publishing fails after all retries', async () => {
            clientProxyMock.emit.mockReturnValue((0, rxjs_1.throwError)(() => new Error('Publish failed')));
            await expect(service.publish('test-event', { data: 'test-data' }, 3)).rejects.toThrow('Failed to publish event after 3 retries: test-event');
        });
    });
    describe('subscribe', () => {
        it('should return an Observable when subscribing to an event', () => {
            const result = service.subscribe('test-event');
            expect(result).toBeDefined();
            expect(clientProxyMock.send).toHaveBeenCalledWith('test-event', {});
        });
        it('should handle errors when subscribing', (done) => {
            clientProxyMock.send.mockReturnValueOnce((0, rxjs_1.throwError)(() => new Error('Subscription failed')));
            service.subscribe('test-event').subscribe({
                error: (error) => {
                    expect(error.message).toBe('Failed to subscribe to event: test-event');
                    done();
                }
            });
        });
    });
    describe('handleIncomingMessage', () => {
        it('should handle incoming messages correctly', (done) => {
            const mockHandler = jest.fn().mockResolvedValue(undefined);
            clientProxyMock.send.mockReturnValueOnce((0, rxjs_1.of)({ data: 'test-data' }));
            service.handleIncomingMessage('test-event', mockHandler);
            setTimeout(() => {
                expect(mockHandler).toHaveBeenCalledWith({ data: 'test-data' });
                done();
            }, 100);
        });
        it('should handle errors in message processing', (done) => {
            const mockHandler = jest.fn().mockRejectedValue(new Error('Processing failed'));
            clientProxyMock.send.mockReturnValueOnce((0, rxjs_1.of)({ data: 'test-data' }));
            service.handleIncomingMessage('test-event', mockHandler);
            setTimeout(() => {
                expect(mockHandler).toHaveBeenCalledWith({ data: 'test-data' });
                done();
            }, 100);
        });
    });
});
//# sourceMappingURL=event.service.spec.js.map