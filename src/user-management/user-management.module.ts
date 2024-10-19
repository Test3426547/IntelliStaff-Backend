import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserManagementService } from './user-management.service';
import { UserManagementController } from './user-management.controller';
import { TerminusModule } from '@nestjs/terminus';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    TerminusModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
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
