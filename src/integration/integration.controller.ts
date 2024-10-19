import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('integration')
@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a resource by ID' })
  @ApiResponse({ status: 200, description: 'Resource found' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiParam({ name: 'id', type: 'string' })
  async getResource(@Param('id') id: string) {
    return this.integrationService.getResource(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new resource' })
  @ApiResponse({ status: 201, description: 'Resource created' })
  @ApiBody({ description: 'Resource data' })
  async createResource(@Body() data: any) {
    return this.integrationService.createResource(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a resource' })
  @ApiResponse({ status: 200, description: 'Resource updated' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ description: 'Updated resource data' })
  async updateResource(@Param('id') id: string, @Body() data: any) {
    return this.integrationService.updateResource(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a resource' })
  @ApiResponse({ status: 204, description: 'Resource deleted' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiParam({ name: 'id', type: 'string' })
  async deleteResource(@Param('id') id: string) {
    await this.integrationService.deleteResource(id);
    return { message: 'Resource deleted successfully' };
  }
}
