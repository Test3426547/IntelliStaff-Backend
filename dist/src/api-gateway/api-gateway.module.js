"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const api_gateway_service_1 = require("./api-gateway.service");
const api_gateway_controller_1 = require("./api-gateway.controller");
const jwt_1 = require("@nestjs/jwt");
const throttler_1 = require("@nestjs/throttler");
let ApiGatewayModule = class ApiGatewayModule {
};
exports.ApiGatewayModule = ApiGatewayModule;
exports.ApiGatewayModule = ApiGatewayModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: '1h' },
                }),
                inject: [ConfigService],
            }),
            throttler_1.ThrottlerModule.forRoot({
                ttl: 60,
                limit: 10,
            }),
        ],
        providers: [api_gateway_service_1.ApiGatewayService],
        controllers: [api_gateway_controller_1.ApiGatewayController],
        exports: [api_gateway_service_1.ApiGatewayService],
    })
], ApiGatewayModule);
//# sourceMappingURL=api-gateway.module.js.map