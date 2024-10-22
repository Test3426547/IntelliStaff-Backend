"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const ml_model_management_service_1 = require("./ml-model-management.service");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
jest.mock('@supabase/supabase-js');
jest.mock('@tensorflow/tfjs-node');
describe('MlModelManagementService', () => {
    let service;
    let mockConfigService;
    let mockSupabaseClient;
    beforeEach(async () => {
        mockConfigService = {
            get: jest.fn().mockImplementation((key) => {
                const config = {
                    SUPABASE_URL: 'https://example.supabase.co',
                    SUPABASE_KEY: 'mock-key',
                    HUGGINGFACE_API_KEY: 'mock-huggingface-key',
                    HUGGINGFACE_INFERENCE_ENDPOINT: 'https://api-inference.huggingface.co/models/mock-model',
                };
                return config[key];
            }),
        };
        mockSupabaseClient = {
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ data: [{ id: 1, name: 'test-model', version: '1.0', data: {} }], error: null }),
            insert: jest.fn().mockResolvedValue({ error: null }),
            update: jest.fn().mockResolvedValue({ error: null }),
        };
        supabase_js_1.createClient.mockReturnValue(mockSupabaseClient);
        const module = await testing_1.Test.createTestingModule({
            providers: [
                ml_model_management_service_1.MlModelManagementService,
                { provide: config_1.ConfigService, useValue: mockConfigService },
            ],
        }).compile();
        service = module.get(ml_model_management_service_1.MlModelManagementService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('getModel', () => {
        it('should return a model', async () => {
            const result = await service.getModel('test-model');
            expect(result).toEqual({ id: 1, name: 'test-model', version: '1.0', data: {} });
        });
    });
    describe('updateModel', () => {
        it('should update a model', async () => {
            await expect(service.updateModel('test-model', { data: 'new-data' }, { metadata: 'test' })).resolves.not.toThrow();
        });
    });
    describe('listModels', () => {
        it('should list models', async () => {
            mockSupabaseClient.select.mockReturnValueOnce({
                order: jest.fn().mockResolvedValue({ data: [{ name: 'model1' }, { name: 'model2' }], error: null }),
            });
            const result = await service.listModels();
            expect(result).toEqual([{ name: 'model1' }, { name: 'model2' }]);
        });
    });
    describe('runInference', () => {
        it('should run inference', async () => {
            jest.spyOn(global, 'fetch').mockResolvedValueOnce({
                json: jest.fn().mockResolvedValueOnce({ result: 'mocked inference result' }),
            });
            const result = await service.runInference('test-model', { input: 'test input' });
            expect(result).toEqual({ result: 'mocked inference result' });
        });
    });
});
//# sourceMappingURL=ml-model-management.service.spec.js.map