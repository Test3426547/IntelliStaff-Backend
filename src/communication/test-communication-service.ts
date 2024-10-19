import { Test, TestingModule } from '@nestjs/testing';
import { CommunicationService } from './communication.service';
import { ConfigService } from '@nestjs/config';

describe('CommunicationService', () => {
  let communicationService: CommunicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunicationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              // Mock the necessary configuration values
              if (key === 'HUGGINGFACE_API_KEY') return 'mock-api-key';
              if (key === 'HUGGINGFACE_INFERENCE_ENDPOINT') return 'https://mock-endpoint.com';
              return null;
            }),
          },
        },
      ],
    }).compile();

    communicationService = module.get<CommunicationService>(CommunicationService);
  });

  it('should be defined', () => {
    expect(communicationService).toBeDefined();
  });

  it('should generate AI response', async () => {
    const mockResponse = { choices: [{ message: { content: 'Mock AI response' } }] };
    jest.spyOn(communicationService['openai'].chat.completions, 'create').mockResolvedValue(mockResponse as any);

    const result = await communicationService.generateAIResponse('Test prompt');
    expect(result).toBe('Mock AI response');
  });
});
