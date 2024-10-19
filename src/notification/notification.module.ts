import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { MlModelManagementModule } from '../ml-model-management/ml-model-management.module';
import { CommunicationModule } from '../communication/communication.module';

@Module({
  imports: [MlModelManagementModule, CommunicationModule],
  providers: [NotificationService, NotificationGateway],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
