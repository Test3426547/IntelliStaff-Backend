"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagementModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const user_management_service_1 = require("./user-management.service");
const user_management_controller_1 = require("./user-management.controller");
const terminus_1 = require("@nestjs/terminus");
const jwt_1 = require("@nestjs/jwt");
let UserManagementModule = class UserManagementModule {
    constructor(userManagementService) {
        this.userManagementService = userManagementService;
    }
    onModuleInit() {
        this.userManagementService.startCacheCleanup();
    }
};
exports.UserManagementModule = UserManagementModule;
exports.UserManagementModule = UserManagementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            terminus_1.TerminusModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: '1h' },
            }),
        ],
        providers: [user_management_service_1.UserManagementService],
        controllers: [user_management_controller_1.UserManagementController],
        exports: [user_management_service_1.UserManagementService],
    }),
    __metadata("design:paramtypes", [user_management_service_1.UserManagementService])
], UserManagementModule);
//# sourceMappingURL=user-management.module.js.map