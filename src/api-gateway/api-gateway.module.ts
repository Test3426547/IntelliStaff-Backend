import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { UserManagementModule } from '../user-management/user-management.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { AuditLoggingModule } from '../audit-logging/audit-logging.module';
import { EventEmitterService } from '../common/events/event.emitter';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../user-management/auth.guard';

@Module({
  imports: [
    ConfigModule,
    UserManagementModule,
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    AuditLoggingModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ApiGatewayController],
  providers: [
    ApiGatewayService,
    EventEmitterService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class ApiGatewayModule {}
