"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const security_service_1 = require("./security.service");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
jest.mock('@supabase/supabase-js');
describe('SecurityService', () => {
    let service;
    let mockConfigService;
    let mockSupabaseClient;
    beforeEach(async () => {
        mockConfigService = {
            get: jest.fn().mockImplementation((key) => {
                if (key === 'ENCRYPTION_KEY')
                    return '0123456789abcdef0123456789abcdef';
                if (key === 'SUPABASE_URL')
                    return 'https://example.supabase.co';
                if (key === 'SUPABASE_KEY')
                    return 'test-supabase-key';
                return undefined;
            }),
        };
        mockSupabaseClient = {
            from: jest.fn().mockReturnThis(),
            insert: jest.fn().mockResolvedValue({ error: null }),
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            range: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
        };
        supabase_js_1.createClient.mockReturnValue(mockSupabaseClient);
        const module = await testing_1.Test.createTestingModule({
            providers: [
                security_service_1.SecurityService,
                { provide: config_1.ConfigService, useValue: mockConfigService },
            ],
        }).compile();
        service = module.get(security_service_1.SecurityService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('encryptData', () => {
        it('should encrypt data', async () => {
            const result = await service.encryptData('test data');
            expect(result).toHaveProperty('encryptedData');
            expect(result).toHaveProperty('iv');
            expect(result.encryptedData).not.toBe('test data');
        });
    });
    describe('decryptData', () => {
        it('should decrypt data', async () => {
            const { encryptedData, iv } = await service.encryptData('test data');
            const decryptedData = await service.decryptData(encryptedData, iv);
            expect(decryptedData).toBe('test data');
        });
    });
    describe('hashPassword', () => {
        it('should hash a password', async () => {
            const hashedPassword = await service.hashPassword('password123');
            expect(hashedPassword).not.toBe('password123');
        });
    });
    describe('validatePassword', () => {
        it('should validate a correct password', async () => {
            const hashedPassword = await service.hashPassword('password123');
            const isValid = await service.validatePassword('password123', hashedPassword);
            expect(isValid).toBe(true);
        });
        it('should not validate an incorrect password', async () => {
            const hashedPassword = await service.hashPassword('password123');
            const isValid = await service.validatePassword('wrongpassword', hashedPassword);
            expect(isValid).toBe(false);
        });
    });
    describe('detectThreats', () => {
        it('should detect threats in data', async () => {
            const threatDetected = await service.detectThreats({ content: 'malicious code' });
            expect(threatDetected).toBe(true);
        });
        it('should not detect threats in safe data', async () => {
            const threatDetected = await service.detectThreats({ content: 'safe content' });
            expect(threatDetected).toBe(false);
        });
    });
    describe('logSecurityEvent', () => {
        it('should log a security event', async () => {
            await service.logSecurityEvent('user123', 'login', { ip: '127.0.0.1' });
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('security_logs');
            expect(mockSupabaseClient.insert).toHaveBeenCalled();
        });
        it('should throw an error if logging fails', async () => {
            mockSupabaseClient.insert.mockResolvedValueOnce({ error: new Error('Logging failed') });
            await expect(service.logSecurityEvent('user123', 'login', { ip: '127.0.0.1' }))
                .rejects.toThrow('Failed to log security event: Logging failed');
        });
    });
    describe('getSecurityLogs', () => {
        it('should return security logs', async () => {
            const mockLogs = [{ id: 1, event: 'login', user_id: 'user123' }];
            mockSupabaseClient.range.mockResolvedValueOnce({ data: mockLogs, error: null, count: 1 });
            const result = await service.getSecurityLogs();
            expect(result.logs).toEqual(mockLogs);
            expect(result.total).toBe(1);
        });
        it('should throw an error if fetching logs fails', async () => {
            mockSupabaseClient.range.mockResolvedValueOnce({ data: null, error: new Error('Fetch failed'), count: null });
            await expect(service.getSecurityLogs()).rejects.toThrow('Failed to fetch security logs: Fetch failed');
        });
    });
});
//# sourceMappingURL=security.service.spec.js.map