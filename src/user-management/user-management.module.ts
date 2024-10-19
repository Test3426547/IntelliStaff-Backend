import { Module } from '@nestjs/common';
import { UserManagementService } from './user-management.service';
import { UserManagementController } from './user-management.controller';
import { AuthGuard } from './auth.guard';

@Module({
  providers: [UserManagementService, AuthGuard],
  controllers: [UserManagementController],
  exports: [UserManagementService, AuthGuard],
})
export class UserManagementModule {}
