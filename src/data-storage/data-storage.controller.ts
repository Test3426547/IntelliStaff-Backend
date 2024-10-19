import { Controller, Post, Get, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { DataStorageService } from './data-storage.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('data-storage')
@Controller('data-storage')
export class DataStorageController {
  constructor(private readonly dataStorageService: DataStorageService) {}

  @Post(':entityName')
  @ApiOperation({ summary: 'Create a new entity' })
  @ApiResponse({ status: 201, description: 'Entity created successfully' })
  @ApiParam({ name: 'entityName', type: 'string' })
  @ApiBody({ description: 'Entity data' })
  async createEntity(@Param('entityName') entityName: string, @Body() data: any) {
    return this.dataStorageService.createEntity(entityName, data);
  }

  @Get(':entityName/:id')
  @ApiOperation({ summary: 'Get an entity by ID' })
  @ApiResponse({ status: 200, description: 'Entity retrieved successfully' })
  @ApiParam({ name: 'entityName', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  async getEntity(@Param('entityName') entityName: string, @Param('id') id: string) {
    return this.dataStorageService.getEntity(entityName, id);
  }

  @Put(':entityName/:id')
  @ApiOperation({ summary: 'Update an entity' })
  @ApiResponse({ status: 200, description: 'Entity updated successfully' })
  @ApiParam({ name: 'entityName', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ description: 'Updated entity data' })
  async updateEntity(
    @Param('entityName') entityName: string,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.dataStorageService.updateEntity(entityName, id, data);
  }

  @Delete(':entityName/:id')
  @ApiOperation({ summary: 'Delete an entity' })
  @ApiResponse({ status: 200, description: 'Entity deleted successfully' })
  @ApiParam({ name: 'entityName', type: 'string' })
  @ApiParam({ name: 'id', type: 'string' })
  async deleteEntity(@Param('entityName') entityName: string, @Param('id') id: string) {
    await this.dataStorageService.deleteEntity(entityName, id);
    return { message: 'Entity deleted successfully' };
  }

  @Post(':entityName/backup')
  @ApiOperation({ summary: 'Backup data for an entity' })
  @ApiResponse({ status: 200, description: 'Data backed up successfully' })
  @ApiParam({ name: 'entityName', type: 'string' })
  async backupData(@Param('entityName') entityName: string) {
    const backupFileName = await this.dataStorageService.backupData(entityName);
    return { message: 'Data backed up successfully', backupFileName };
  }

  @Post(':entityName/restore')
  @ApiOperation({ summary: 'Restore data for an entity' })
  @ApiResponse({ status: 200, description: 'Data restored successfully' })
  @ApiParam({ name: 'entityName', type: 'string' })
  @ApiQuery({ name: 'backupFileName', type: 'string' })
  async restoreData(
    @Param('entityName') entityName: string,
    @Query('backupFileName') backupFileName: string,
  ) {
    await this.dataStorageService.restoreData(entityName, backupFileName);
    return { message: 'Data restored successfully' };
  }
}
