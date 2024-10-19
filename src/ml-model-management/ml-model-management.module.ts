import { Module } from '@nestjs/common';
import { MlModelManagementService } from './ml-model-management.service';
import { MlModelManagementController } from './ml-model-management.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MlModelManagementService],
  controllers: [MlModelManagementController],
  exports: [MlModelManagementService],
})
export class MlModelManagementModule {}
