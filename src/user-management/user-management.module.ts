import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserManagementService } from './user-management.service';
import { UserManagementController } from './user-management.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [ConfigModule, TerminusModule],
  providers: [UserManagementService],
  controllers: [UserManagementController],
  exports: [UserManagementService],
})
export class UserManagementModule implements OnModuleInit {
  constructor(private userManagementService: UserManagementService) {}

  onModuleInit() {
    this.userManagementService.startCacheCleanup();
  }
}
