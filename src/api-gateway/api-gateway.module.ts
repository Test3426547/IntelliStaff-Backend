import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { CommonModule } from '../common/common.module';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule,
    UserManagementModule,
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
    }),
    AuditLoggingModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    CommonModule,
    TerminusModule,
    HttpModule,
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
