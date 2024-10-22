"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStorageModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const data_storage_service_1 = require("./data-storage.service");
const data_storage_controller_1 = require("./data-storage.controller");
let DataStorageModule = class DataStorageModule {
};
exports.DataStorageModule = DataStorageModule;
exports.DataStorageModule = DataStorageModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    url: configService.get('DATABASE_URL'),
                    autoLoadEntities: true,
                    synchronize: false,
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [data_storage_service_1.DataStorageService],
        controllers: [data_storage_controller_1.DataStorageController],
        exports: [data_storage_service_1.DataStorageService],
    })
], DataStorageModule);
//# sourceMappingURL=data-storage.module.js.map