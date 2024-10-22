import { Module } from '@nestjs/common';
import { MlModelManagementService } from './ml-model-management.service';
import { MlModelManagementController } from './ml-model-management.controller';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
  ],
  providers: [MlModelManagementService],
  controllers: [MlModelManagementController],
  exports: [MlModelManagementService],
})
export class MlModelManagementModule {}
