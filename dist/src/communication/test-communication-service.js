"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const communication_service_1 = require("./communication.service");
const config_1 = require("@nestjs/config");
describe('CommunicationService', () => {
    let communicationService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                communication_service_1.CommunicationService,
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        get: jest.fn((key) => {
                            if (key === 'HUGGINGFACE_API_KEY')
                                return 'mock-api-key';
                            if (key === 'HUGGINGFACE_INFERENCE_ENDPOINT')
                                return 'https://mock-endpoint.com';
                            return null;
                        }),
                    },
                },
            ],
        }).compile();
        communicationService = module.get(communication_service_1.CommunicationService);
    });
    it('should be defined', () => {
        expect(communicationService).toBeDefined();
    });
    it('should generate AI response', async () => {
        const mockResponse = { choices: [{ message: { content: 'Mock AI response' } }] };
        jest.spyOn(communicationService['openai'].chat.completions, 'create').mockResolvedValue(mockResponse);
        const result = await communicationService.generateAIResponse('Test prompt');
        expect(result).toBe('Mock AI response');
    });
});
//# sourceMappingURL=test-communication-service.js.map