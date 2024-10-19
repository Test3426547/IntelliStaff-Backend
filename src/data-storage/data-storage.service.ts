import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection, Repository, EntityTarget, FindManyOptions, DeepPartial } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DataStorageService {
  private readonly logger = new Logger(DataStorageService.name);

  constructor(
    @InjectConnection() private connection: Connection,
    private configService: ConfigService,
  ) {}

  async createEntity<T>(entity: EntityTarget<T>, data: DeepPartial<T>): Promise<T> {
    const repository = this.getRepository(entity);
    const newEntity = repository.create(data);
    return await repository.save(newEntity as T);
  }

  async findEntity<T>(entity: EntityTarget<T>, id: string | number): Promise<T | undefined> {
    const repository = this.getRepository(entity);
    return await repository.findOne({ where: { id } as any });
  }

  async findEntities<T>(entity: EntityTarget<T>, options?: FindManyOptions<T>): Promise<T[]> {
    const repository = this.getRepository(entity);
    return await repository.find(options);
  }

  async updateEntity<T>(entity: EntityTarget<T>, id: string | number, data: DeepPartial<T>): Promise<T | undefined> {
    const repository = this.getRepository(entity);
    await repository.update(id, data as any);
    return await this.findEntity(entity, id);
  }

  async deleteEntity<T>(entity: EntityTarget<T>, id: string | number): Promise<void> {
    const repository = this.getRepository(entity);
    await repository.delete(id);
  }

  async executeQuery(query: string, parameters?: any[]): Promise<any> {
    return await this.connection.query(query, parameters);
  }

  async getTableNames(): Promise<string[]> {
    const tables = await this.connection.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    return tables.map(table => table.table_name);
  }

  private getRepository<T>(entity: EntityTarget<T>): Repository<T> {
    return this.connection.getRepository(entity);
  }

  async backupDatabase(): Promise<string> {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
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
          } else {
            this.logger.log(`Database backup created successfully at ${fullPath}`);
            resolve(stdout);
          }
        });
      });

      return fullPath;
    } catch (error) {
      this.logger.error(`Failed to create database backup: ${error.message}`);
      throw error;
    }
  }

  async restoreDatabase(backupPath: string): Promise<void> {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');

    try {
      await new Promise((resolve, reject) => {
        const { exec } = require('child_process');
        exec(`psql ${databaseUrl} < ${backupPath}`, (error, stdout, stderr) => {
          if (error) {
            this.logger.error(`Error during database restore: ${error.message}`);
            reject(error);
          } else {
            this.logger.log(`Database restored successfully from ${backupPath}`);
            resolve(stdout);
          }
        });
      });
    } catch (error) {
      this.logger.error(`Failed to restore database: ${error.message}`);
      throw error;
    }
  }
}
