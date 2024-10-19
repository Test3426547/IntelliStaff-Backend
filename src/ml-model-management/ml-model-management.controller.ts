import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MlModelManagementService } from './ml-model-management.service';
import { AuthGuard } from '../user-management/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@ApiTags('ml-model-management')
@Controller('ml-model-management')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class MlModelManagementController {
  constructor(
    private readonly mlModelManagementService: MlModelManagementService,
    private health: HealthCheckService
  ) {}

  @Post('store')
  @ApiOperation({ summary: 'Store a new ML model' })
  @ApiResponse({ status: 201, description: 'Model stored successfully' })
  async storeModel(@Body() modelData: { name: string; version: string; data: any }) {
    return this.mlModelManagementService.storeModel(modelData.name, modelData.version, modelData.data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve an ML model' })
  @ApiResponse({ status: 200, description: 'Model retrieved successfully' })
  async retrieveModel(@Param('id') id: string) {
    return this.mlModelManagementService.retrieveModel(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an ML model' })
  @ApiResponse({ status: 200, description: 'Model updated successfully' })
  async updateModel(@Param('id') id: string, @Body() updateData: any) {
    await this.mlModelManagementService.updateModel(id, updateData);
    return { message: 'Model updated successfully' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an ML model' })
  @ApiResponse({ status: 200, description: 'Model deleted successfully' })
  async deleteModel(@Param('id') id: string) {
    await this.mlModelManagementService.deleteModel(id);
    return { message: 'Model deleted successfully' };
  }

  @Post('inference/:id')
  @ApiOperation({ summary: 'Run inference on an ML model' })
  @ApiResponse({ status: 200, description: 'Inference completed successfully' })
  async runInference(@Param('id') id: string, @Body() inputData: any) {
    return this.mlModelManagementService.runInference(id, inputData);
  }

  @Post('huggingface-inference/:modelName')
  @ApiOperation({ summary: 'Run inference on a HuggingFace model' })
  @ApiResponse({ status: 200, description: 'HuggingFace inference completed successfully' })
  async runHuggingFaceInference(@Param('modelName') modelName: string, @Body() inputData: any) {
    return this.mlModelManagementService.runHuggingFaceInference(modelName, inputData);
  }

  @Post('monitor-performance/:id')
  @ApiOperation({ summary: 'Monitor model performance' })
  @ApiResponse({ status: 200, description: 'Performance metrics stored successfully' })
  async monitorModelPerformance(@Param('id') id: string, @Body() metrics: any) {
    await this.mlModelManagementService.monitorModelPerformance(id, metrics);
    return { message: 'Performance metrics stored successfully' };
  }

  @Get('performance-history/:id')
  @ApiOperation({ summary: 'Get model performance history' })
  @ApiResponse({ status: 200, description: 'Performance history retrieved successfully' })
  async getModelPerformanceHistory(@Param('id') id: string) {
    return this.mlModelManagementService.getModelPerformanceHistory(id);
  }

  @Post('ab-test')
  @ApiOperation({ summary: 'Run A/B test on two models' })
  @ApiResponse({ status: 200, description: 'A/B test completed successfully' })
  async runABTest(@Body() testData: { modelAId: string; modelBId: string; testData: any }) {
    return this.mlModelManagementService.runABTest(testData.modelAId, testData.modelBId, testData.testData);
  }

  @Get('ab-test-history')
  @ApiOperation({ summary: 'Get A/B test history' })
  @ApiResponse({ status: 200, description: 'A/B test history retrieved successfully' })
  async getABTestHistory() {
    return this.mlModelManagementService.getABTestHistory();
  }

  @Get('compare-versions/:id1/:id2')
  @ApiOperation({ summary: 'Compare two model versions' })
  @ApiResponse({ status: 200, description: 'Model versions compared successfully' })
  async compareModelVersions(@Param('id1') id1: string, @Param('id2') id2: string) {
    return this.mlModelManagementService.compareModelVersions(id1, id2);
  }

  @Get('health')
  @HealthCheck()
  @ApiOperation({ summary: 'Check the health of the ML Model Management service' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async checkHealth() {
    return this.health.check([
      () => this.mlModelManagementService.checkHealth(),
    ]);
  }
}
