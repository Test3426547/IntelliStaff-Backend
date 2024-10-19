import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';

describe('EventService', () => {
  let service: EventService;
  let clientProxyMock: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    clientProxyMock = {
      emit: jest.fn().mockReturnValue(of(undefined)),
      send: jest.fn().mockReturnValue(of({})),
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: 'RABBIT_MQ_CLIENT',
          useValue: clientProxyMock,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
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
        .mockReturnValueOnce(throwError(() => new Error('Publish failed')))
        .mockReturnValueOnce(throwError(() => new Error('Publish failed')))
        .mockReturnValueOnce(of(undefined));
      
      await service.publish('test-event', { data: 'test-data' }, 3);
      expect(clientProxyMock.emit).toHaveBeenCalledTimes(3);
    });

    it('should throw an error if publishing fails after all retries', async () => {
      clientProxyMock.emit.mockReturnValue(throwError(() => new Error('Publish failed')));
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
      clientProxyMock.send.mockReturnValueOnce(throwError(() => new Error('Subscription failed')));
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
      clientProxyMock.send.mockReturnValueOnce(of({ data: 'test-data' }));

      service.handleIncomingMessage('test-event', mockHandler);

      setTimeout(() => {
        expect(mockHandler).toHaveBeenCalledWith({ data: 'test-data' });
        done();
      }, 100);
    });

    it('should handle errors in message processing', (done) => {
      const mockHandler = jest.fn().mockRejectedValue(new Error('Processing failed'));
      clientProxyMock.send.mockReturnValueOnce(of({ data: 'test-data' }));

      service.handleIncomingMessage('test-event', mockHandler);

      setTimeout(() => {
        expect(mockHandler).toHaveBeenCalledWith({ data: 'test-data' });
        done();
      }, 100);
    });
  });
});
