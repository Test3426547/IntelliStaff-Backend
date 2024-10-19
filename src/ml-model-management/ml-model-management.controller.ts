import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFile, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { MlModelManagementService } from './ml-model-management.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('ml-model-management')
@Controller('ml-model-management')
export class MlModelManagementController {
  constructor(private readonly mlModelManagementService: MlModelManagementService) {}

  @Get('models/:modelName')
  @ApiOperation({ summary: 'Get a specific model' })
  @ApiResponse({ status: 200, description: 'Returns the requested model' })
  @ApiResponse({ status: 404, description: 'Model not found' })
  @ApiParam({ name: 'modelName', type: 'string' })
  @ApiQuery({ name: 'version', required: false, type: 'string' })
  async getModel(@Param('modelName') modelName: string, @Query('version') version?: string) {
    try {
      return await this.mlModelManagementService.getModel(modelName, version);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve model');
    }
  }

  @Post('models/update')
  @ApiOperation({ summary: 'Update a model' })
  @ApiResponse({ status: 200, description: 'Model updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiBody({ schema: { type: 'object', properties: { modelName: { type: 'string' }, modelData: { type: 'object' }, metadata: { type: 'object' } } } })
  async updateModel(
    @Body('modelName') modelName: string,
    @Body('modelData') modelData: any,
    @Body('metadata') metadata: any
  ) {
    if (!modelName || !modelData) {
      throw new BadRequestException('Model name and data are required');
    }
    await this.mlModelManagementService.updateModel(modelName, modelData, metadata);
    return { message: 'Model updated successfully' };
  }

  @Get('models/:modelName/versions')
  @ApiOperation({ summary: 'Get all versions of a model' })
  @ApiResponse({ status: 200, description: 'Returns all versions of the specified model' })
  @ApiResponse({ status: 404, description: 'Model not found' })
  @ApiParam({ name: 'modelName', type: 'string' })
  async getAllModelVersions(@Param('modelName') modelName: string) {
    try {
      return await this.mlModelManagementService.getAllModelVersions(modelName);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve model versions');
    }
  }

  @Post('models/:modelName/performance')
  @ApiOperation({ summary: 'Track model performance' })
  @ApiResponse({ status: 200, description: 'Performance metrics tracked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiParam({ name: 'modelName', type: 'string' })
  @ApiBody({ schema: { type: 'object', properties: { version: { type: 'string' }, metrics: { type: 'object' } } } })
  async trackModelPerformance(
    @Param('modelName') modelName: string,
    @Body('version') version: string,
    @Body('metrics') metrics: any
  ) {
    if (!version || !metrics) {
      throw new BadRequestException('Version and metrics are required');
    }
    await this.mlModelManagementService.trackModelPerformance(modelName, version, metrics);
    return { message: 'Performance metrics tracked successfully' };
  }

  @Post('models/:modelName/inference')
  @ApiOperation({ summary: 'Run HuggingFace inference' })
  @ApiResponse({ status: 200, description: 'Inference completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiParam({ name: 'modelName', type: 'string' })
  @ApiBody({ schema: { type: 'object', properties: { inputData: { type: 'object' } } } })
  async runHuggingFaceInference(
    @Param('modelName') modelName: string,
    @Body('inputData') inputData: any
  ) {
    if (!inputData) {
      throw new BadRequestException('Input data is required');
    }
    return await this.mlModelManagementService.runHuggingFaceInference(modelName, inputData);
  }

  @Post('models/:modelName/compare')
  @ApiOperation({ summary: 'Compare model versions' })
  @ApiResponse({ status: 200, description: 'Model versions compared successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiParam({ name: 'modelName', type: 'string' })
  @ApiBody({ schema: { type: 'object', properties: { versions: { type: 'array', items: { type: 'string' } } } } })
  async compareModelVersions(
    @Param('modelName') modelName: string,
    @Body('versions') versions: string[]
  ) {
    if (!versions || versions.length < 2) {
      throw new BadRequestException('At least two versions are required for comparison');
    }
    return await this.mlModelManagementService.compareModelVersions(modelName, versions);
  }

  @Post('models/:modelName/rollback')
  @ApiOperation({ summary: 'Rollback a model to a previous version' })
  @ApiResponse({ status: 200, description: 'Model rolled back successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Model or version not found' })
  @ApiParam({ name: 'modelName', type: 'string' })
  @ApiBody({ schema: { type: 'object', properties: { version: { type: 'string' } } } })
  async rollbackModel(
    @Param('modelName') modelName: string,
    @Body('version') version: string
  ) {
    if (!version) {
      throw new BadRequestException('Version is required for rollback');
    }
    await this.mlModelManagementService.rollbackModel(modelName, version);
    return { message: 'Model rolled back successfully' };
  }

  @Post('cache/cleanup')
  @ApiOperation({ summary: 'Manually trigger cache cleanup' })
  @ApiResponse({ status: 200, description: 'Cache cleanup triggered successfully' })
  async triggerCacheCleanup() {
    this.mlModelManagementService.clearExpiredCache();
    return { message: 'Cache cleanup triggered successfully' };
  }
}
