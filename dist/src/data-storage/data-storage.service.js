"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DataStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStorageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let DataStorageService = DataStorageService_1 = class DataStorageService {
    constructor(connection, configService) {
        this.connection = connection;
        this.configService = configService;
        this.logger = new common_1.Logger(DataStorageService_1.name);
    }
    async createEntity(entity, data) {
        const repository = this.getRepository(entity);
        const newEntity = repository.create(data);
        return await repository.save(newEntity);
    }
    async findEntity(entity, id) {
        const repository = this.getRepository(entity);
        return await repository.findOne({ where: { id } });
    }
    async findEntities(entity, options) {
        const repository = this.getRepository(entity);
        return await repository.find(options);
    }
    async updateEntity(entity, id, data) {
        const repository = this.getRepository(entity);
        await repository.update(id, data);
        return await this.findEntity(entity, id);
    }
    async deleteEntity(entity, id) {
        const repository = this.getRepository(entity);
        await repository.delete(id);
    }
    async executeQuery(query, parameters) {
        return await this.connection.query(query, parameters);
    }
    async getTableNames() {
        const tables = await this.connection.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        return tables.map(table => table.table_name);
    }
    getRepository(entity) {
        return this.connection.getRepository(entity);
    }
    async backupDatabase() {
        const databaseUrl = this.configService.get('DATABASE_URL');
        const backupPath = path.join(__dirname, '..', '..', 'backups');
        const fileName = `backup_${new Date().toISOString().replace(/:/g, '-')}.sql`;
        const fullPath = path.join(backupPath, fileName);
        if (!fs.existsSync(backupPath)) {
            fs.mkdirSync(backupPath, { recursive: true });
        }
        try {
            await new Promise((resolve, reject) => {
                const { exec } = require('child_process');
                exec(`pg_dump ${databaseUrl} > ${fullPath}`, (error, stdout, stderr) => {
                    if (error) {
                        this.logger.error(`Error during database backup: ${error.message}`);
                        reject(error);
                    }
                    else {
                        this.logger.log(`Database backup created successfully at ${fullPath}`);
                        resolve(stdout);
                    }
                });
            });
            return fullPath;
        }
        catch (error) {
            this.logger.error(`Failed to create database backup: ${error.message}`);
            throw error;
        }
    }
    async restoreDatabase(backupPath) {
        const databaseUrl = this.configService.get('DATABASE_URL');
        try {
            await new Promise((resolve, reject) => {
                const { exec } = require('child_process');
                exec(`psql ${databaseUrl} < ${backupPath}`, (error, stdout, stderr) => {
                    if (error) {
                        this.logger.error(`Error during database restore: ${error.message}`);
                        reject(error);
                    }
                    else {
                        this.logger.log(`Database restored successfully from ${backupPath}`);
                        resolve(stdout);
                    }
                });
            });
        }
        catch (error) {
            this.logger.error(`Failed to restore database: ${error.message}`);
            throw error;
        }
    }
};
exports.DataStorageService = DataStorageService;
exports.DataStorageService = DataStorageService = DataStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectConnection)()),
    __metadata("design:paramtypes", [typeorm_2.Connection,
        config_1.ConfigService])
], DataStorageService);
//# sourceMappingURL=data-storage.service.js.map