import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('integration')
@Controller('integration')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get(':resourceId')
  @ApiOperation({ summary: 'Get external data' })
  @ApiResponse({ status: 200, description: 'External data retrieved successfully' })
  async getExternalData(@Param('resourceId') resourceId: string) {
    return this.integrationService.getExternalData(resourceId);
  }

  @Post()
  @ApiOperation({ summary: 'Create external resource' })
  @ApiResponse({ status: 201, description: 'External resource created successfully' })
  async createExternalResource(@Body() data: any) {
    return this.integrationService.createExternalResource(data);
  }

  @Put(':resourceId')
  @ApiOperation({ summary: 'Update external resource' })
  @ApiResponse({ status: 200, description: 'External resource updated successfully' })
  async updateExternalResource(@Param('resourceId') resourceId: string, @Body() data: any) {
    return this.integrationService.updateExternalResource(resourceId, data);
  }

  @Delete(':resourceId')
  @ApiOperation({ summary: 'Delete external resource' })
  @ApiResponse({ status: 200, description: 'External resource deleted successfully' })
  async deleteExternalResource(@Param('resourceId') resourceId: string) {
    return this.integrationService.deleteExternalResource(resourceId);
  }
}
