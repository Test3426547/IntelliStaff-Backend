import { Controller, Get, Post, Body, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
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
  @ApiParam({ name: 'modelName', type: 'string' })
  @ApiQuery({ name: 'version', required: false, type: 'string' })
  async getModel(@Param('modelName') modelName: string, @Query('version') version?: string) {
    return this.mlModelManagementService.getModel(modelName, version);
  }

  @Post('models/update')
  @ApiOperation({ summary: 'Update a model' })
  @ApiResponse({ status: 200, description: 'Model updated successfully' })
  @ApiBody({ schema: { type: 'object', properties: { modelName: { type: 'string' }, modelData: { type: 'object' } } } })
  async updateModel(@Body('modelName') modelName: string, @Body('modelData') modelData: any) {
    await this.mlModelManagementService.updateModel(modelName, modelData);
    return { message: 'Model updated successfully' };
  }

  @Get('models')
  @ApiOperation({ summary: 'List all available models' })
  @ApiResponse({ status: 200, description: 'Returns a list of all available models' })
  async listModels() {
    return this.mlModelManagementService.listModels();
  }

  @Get('models/:modelName/performance')
  @ApiOperation({ summary: 'Get model performance metrics' })
  @ApiResponse({ status: 200, description: 'Returns performance metrics for the specified model' })
  @ApiParam({ name: 'modelName', type: 'string' })
  @ApiQuery({ name: 'version', required: false, type: 'string' })
  async getModelPerformance(@Param('modelName') modelName: string, @Query('version') version?: string) {
    return this.mlModelManagementService.getModelPerformance(modelName, version);
  }

  @Post('models/:modelName/inference')
  @ApiOperation({ summary: 'Run inference on a model' })
  @ApiResponse({ status: 200, description: 'Returns the inference result' })
  @ApiParam({ name: 'modelName', type: 'string' })
  @ApiBody({ schema: { type: 'object', properties: { inputData: { type: 'object' } } } })
  async runInference(@Param('modelName') modelName: string, @Body('inputData') inputData: any) {
    return this.mlModelManagementService.runInference(modelName, inputData);
  }

  @Get('models/:modelName/compare')
  @ApiOperation({ summary: 'Compare two versions of a model' })
  @ApiResponse({ status: 200, description: 'Returns a comparison of the two model versions' })
  @ApiParam({ name: 'modelName', type: 'string' })
  @ApiQuery({ name: 'version1', required: true, type: 'string' })
  @ApiQuery({ name: 'version2', required: true, type: 'string' })
  async compareModelVersions(
    @Param('modelName') modelName: string,
    @Query('version1') version1: string,
    @Query('version2') version2: string,
  ) {
    return this.mlModelManagementService.compareModelVersions(modelName, version1, version2);
  }

  @Post('models/:modelName/abtest')
  @ApiOperation({ summary: 'Run A/B test on two versions of a model' })
  @ApiResponse({ status: 200, description: 'Returns the results of the A/B test' })
  @ApiParam({ name: 'modelName', type: 'string' })
  @ApiQuery({ name: 'version1', required: true, type: 'string' })
  @ApiQuery({ name: 'version2', required: true, type: 'string' })
  @ApiBody({ schema: { type: 'object', properties: { testData: { type: 'array', items: { type: 'object' } } } } })
  async runABTest(
    @Param('modelName') modelName: string,
    @Query('version1') version1: string,
    @Query('version2') version2: string,
    @Body('testData') testData: any[],
  ) {
    return this.mlModelManagementService.runABTest(modelName, version1, version2, testData);
  }

  @Get('models/:modelName/export')
  @ApiOperation({ summary: 'Export a model' })
  @ApiResponse({ status: 200, description: 'Returns the exported model as a file' })
  @ApiParam({ name: 'modelName', type: 'string' })
  @ApiQuery({ name: 'version', required: false, type: 'string' })
  async exportModel(@Param('modelName') modelName: string, @Query('version') version?: string) {
    return this.mlModelManagementService.exportModel(modelName, version);
  }

  @Post('models/:modelName/import')
  @ApiOperation({ summary: 'Import a model' })
  @ApiResponse({ status: 200, description: 'Model imported successfully' })
  @ApiParam({ name: 'modelName', type: 'string' })
  @UseInterceptors(FileInterceptor('file'))
  async importModel(@Param('modelName') modelName: string, @UploadedFile() file: Express.Multer.File) {
    await this.mlModelManagementService.importModel(modelName, file.buffer);
    return { message: 'Model imported successfully' };
  }
}
