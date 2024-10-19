import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DataStorageService } from './data-storage.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('data-storage')
@Controller('data-storage')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class DataStorageController {
  constructor(private readonly dataStorageService: DataStorageService) {}

  @Post('entities/:entity')
  @ApiOperation({ summary: 'Create a new entity' })
  @ApiResponse({ status: 201, description: 'Entity created successfully' })
  async createEntity(@Param('entity') entityName: string, @Body() data: any) {
    return this.dataStorageService.createEntity(entityName, data);
  }

  @Get('entities/:entity/:id')
  @ApiOperation({ summary: 'Find an entity by ID' })
  @ApiResponse({ status: 200, description: 'Entity found successfully' })
  async findEntity(@Param('entity') entityName: string, @Param('id') id: string) {
    return this.dataStorageService.findEntity(entityName, id);
  }

  @Get('entities/:entity')
  @ApiOperation({ summary: 'Find entities with options' })
  @ApiResponse({ status: 200, description: 'Entities found successfully' })
  async findEntities(@Param('entity') entityName: string, @Query() options: any) {
    return this.dataStorageService.findEntities(entityName, options);
  }

  @Put('entities/:entity/:id')
  @ApiOperation({ summary: 'Update an entity' })
  @ApiResponse({ status: 200, description: 'Entity updated successfully' })
  async updateEntity(@Param('entity') entityName: string, @Param('id') id: string, @Body() data: any) {
    return this.dataStorageService.updateEntity(entityName, id, data);
  }

  @Delete('entities/:entity/:id')
  @ApiOperation({ summary: 'Delete an entity' })
  @ApiResponse({ status: 200, description: 'Entity deleted successfully' })
  async deleteEntity(@Param('entity') entityName: string, @Param('id') id: string) {
    await this.dataStorageService.deleteEntity(entityName, id);
    return { message: 'Entity deleted successfully' };
  }

  @Post('query')
  @ApiOperation({ summary: 'Execute a custom query' })
  @ApiResponse({ status: 200, description: 'Query executed successfully' })
  async executeQuery(@Body() queryData: { query: string; parameters?: any[] }) {
    return this.dataStorageService.executeQuery(queryData.query, queryData.parameters);
  }

  @Get('tables')
  @ApiOperation({ summary: 'Get all table names' })
  @ApiResponse({ status: 200, description: 'Table names retrieved successfully' })
  async getTableNames() {
    return this.dataStorageService.getTableNames();
  }

  @Post('backup')
  @ApiOperation({ summary: 'Create a database backup' })
  @ApiResponse({ status: 201, description: 'Database backup created successfully' })
  async createBackup() {
    const backupPath = await this.dataStorageService.backupDatabase();
    return { message: 'Database backup created successfully', backupPath };
  }

  @Post('restore')
  @ApiOperation({ summary: 'Restore database from a backup' })
  @ApiResponse({ status: 200, description: 'Database restored successfully' })
  async restoreBackup(@Body('backupPath') backupPath: string) {
    await this.dataStorageService.restoreDatabase(backupPath);
    return { message: 'Database restored successfully' };
  }
}
