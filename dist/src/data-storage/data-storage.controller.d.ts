import { DataStorageService } from './data-storage.service';
export declare class DataStorageController {
    private readonly dataStorageService;
    constructor(dataStorageService: DataStorageService);
    createEntity(entityName: string, data: any): Promise<any>;
    findEntity(entityName: string, id: string): Promise<unknown>;
    findEntities(entityName: string, options: any): Promise<unknown[]>;
    updateEntity(entityName: string, id: string, data: any): Promise<any>;
    deleteEntity(entityName: string, id: string): Promise<{
        message: string;
    }>;
    executeQuery(queryData: {
        query: string;
        parameters?: any[];
    }): Promise<any>;
    getTableNames(): Promise<string[]>;
    createBackup(): Promise<{
        message: string;
        backupPath: string;
    }>;
    restoreBackup(backupPath: string): Promise<{
        message: string;
    }>;
}
