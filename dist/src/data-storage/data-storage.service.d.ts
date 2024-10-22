import { Connection, EntityTarget, FindManyOptions, DeepPartial } from 'typeorm';
import { ConfigService } from '@nestjs/config';
export declare class DataStorageService {
    private connection;
    private configService;
    private readonly logger;
    constructor(connection: Connection, configService: ConfigService);
    createEntity<T>(entity: EntityTarget<T>, data: DeepPartial<T>): Promise<T>;
    findEntity<T>(entity: EntityTarget<T>, id: string | number): Promise<T | undefined>;
    findEntities<T>(entity: EntityTarget<T>, options?: FindManyOptions<T>): Promise<T[]>;
    updateEntity<T>(entity: EntityTarget<T>, id: string | number, data: DeepPartial<T>): Promise<T | undefined>;
    deleteEntity<T>(entity: EntityTarget<T>, id: string | number): Promise<void>;
    executeQuery(query: string, parameters?: any[]): Promise<any>;
    getTableNames(): Promise<string[]>;
    private getRepository;
    backupDatabase(): Promise<string>;
    restoreDatabase(backupPath: string): Promise<void>;
}
