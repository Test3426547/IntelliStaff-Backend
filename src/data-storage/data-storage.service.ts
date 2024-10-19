import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class DataStorageService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(DataStorageService.name);

  constructor(
    private configService: ConfigService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
  }

  async createEntity(entityName: string, data: any): Promise<any> {
    try {
      const { data: createdEntity, error } = await this.supabase
        .from(entityName)
        .insert(data)
        .single();

      if (error) throw new Error(`Failed to create entity: ${error.message}`);

      return createdEntity;
    } catch (error) {
      this.logger.error(`Error creating entity: ${error.message}`);
      throw error;
    }
  }

  async getEntity(entityName: string, id: string): Promise<any> {
    try {
      const { data: entity, error } = await this.supabase
        .from(entityName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw new Error(`Failed to get entity: ${error.message}`);

      return entity;
    } catch (error) {
      this.logger.error(`Error getting entity: ${error.message}`);
      throw error;
    }
  }

  async updateEntity(entityName: string, id: string, data: any): Promise<any> {
    try {
      const { data: updatedEntity, error } = await this.supabase
        .from(entityName)
        .update(data)
        .eq('id', id)
        .single();

      if (error) throw new Error(`Failed to update entity: ${error.message}`);

      return updatedEntity;
    } catch (error) {
      this.logger.error(`Error updating entity: ${error.message}`);
      throw error;
    }
  }

  async deleteEntity(entityName: string, id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(entityName)
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Failed to delete entity: ${error.message}`);
    } catch (error) {
      this.logger.error(`Error deleting entity: ${error.message}`);
      throw error;
    }
  }

  async backupData(entityName: string): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from(entityName)
        .select('*');

      if (error) throw new Error(`Failed to fetch data for backup: ${error.message}`);

      const backupFileName = `${entityName}_backup_${Date.now()}.json`;
      const { error: uploadError } = await this.supabase
        .storage
        .from('backups')
        .upload(backupFileName, JSON.stringify(data));

      if (uploadError) throw new Error(`Failed to upload backup: ${uploadError.message}`);

      return backupFileName;
    } catch (error) {
      this.logger.error(`Error backing up data: ${error.message}`);
      throw error;
    }
  }

  async restoreData(entityName: string, backupFileName: string): Promise<void> {
    try {
      const { data, error: downloadError } = await this.supabase
        .storage
        .from('backups')
        .download(backupFileName);

      if (downloadError) throw new Error(`Failed to download backup: ${downloadError.message}`);

      const backupData = JSON.parse(await data.text());

      const { error: deleteError } = await this.supabase
        .from(entityName)
        .delete();

      if (deleteError) throw new Error(`Failed to clear existing data: ${deleteError.message}`);

      const { error: insertError } = await this.supabase
        .from(entityName)
        .insert(backupData);

      if (insertError) throw new Error(`Failed to restore data: ${insertError.message}`);

      this.logger.log(`Data restored successfully for ${entityName}`);
    } catch (error) {
      this.logger.error(`Error restoring data: ${error.message}`);
      throw error;
    }
  }
}
