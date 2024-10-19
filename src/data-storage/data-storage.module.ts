import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataStorageService } from './data-storage.service';
import { DataStorageController } from './data-storage.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false, // Set to false in production
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DataStorageService],
  controllers: [DataStorageController],
  exports: [DataStorageService],
})
export class DataStorageModule {}
