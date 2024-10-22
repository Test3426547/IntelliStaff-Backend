"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const data_storage_service_1 = require("./data-storage.service");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("typeorm");
class TestEntity {
}
describe('DataStorageService', () => {
    let service;
    let configService;
    let mockRepository;
    let mockConnection;
    let mockDataSource;
    beforeEach(async () => {
        mockRepository = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };
        mockConnection = {
            getRepository: jest.fn().mockReturnValue(mockRepository),
            query: jest.fn(),
        };
        mockDataSource = {
            getRepository: jest.fn().mockReturnValue(mockRepository),
            createQueryRunner: jest.fn(),
        };
        const module = await testing_1.Test.createTestingModule({
            imports: [config_1.ConfigModule.forRoot()],
            providers: [
                data_storage_service_1.DataStorageService,
                {
                    provide: typeorm_1.DataSource,
                    useValue: mockDataSource,
                },
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('mock_database_url'),
                    },
                },
            ],
        }).compile();
        service = module.get(data_storage_service_1.DataStorageService);
        configService = module.get(config_1.ConfigService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('createEntity', () => {
        it('should create an entity', async () => {
            const entityData = { name: 'Test Entity' };
            mockRepository.create.mockReturnValue(entityData);
            mockRepository.save.mockResolvedValue(entityData);
            const result = await service.createEntity(TestEntity, entityData);
            expect(result).toEqual(entityData);
            expect(mockRepository.create).toHaveBeenCalledWith(entityData);
            expect(mockRepository.save).toHaveBeenCalledWith(entityData);
        });
    });
    describe('findEntity', () => {
        it('should find an entity by id', async () => {
            const entityData = { id: '1', name: 'Test Entity' };
            mockRepository.findOne.mockResolvedValue(entityData);
            const result = await service.findEntity(TestEntity, '1');
            expect(result).toEqual(entityData);
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
        });
    });
    describe('backupDatabase', () => {
        it('should create a database backup', async () => {
            const execMock = jest.fn((command, callback) => callback(null, 'Backup successful', ''));
            jest.spyOn(require('child_process'), 'exec').mockImplementation(execMock);
            const backupPath = await service.backupDatabase();
            expect(backupPath).toContain('backups/backup_');
            expect(execMock).toHaveBeenCalled();
        });
    });
    describe('restoreDatabase', () => {
        it('should restore the database from a backup', async () => {
            const execMock = jest.fn((command, callback) => callback(null, 'Restore successful', ''));
            jest.spyOn(require('child_process'), 'exec').mockImplementation(execMock);
            const backupPath = '/path/to/backup.sql';
            await expect(service.restoreDatabase(backupPath)).resolves.not.toThrow();
            expect(execMock).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=data-storage.service.spec.js.map