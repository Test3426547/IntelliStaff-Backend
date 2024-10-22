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
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const user_management_service_1 = require("./user-management.service");
let AuthGuard = class AuthGuard {
    constructor(userManagementService) {
        this.userManagementService = userManagementService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new common_1.UnauthorizedException('Missing authentication token');
        }
        try {
            const user = await this.userManagementService.getUser(token);
            if (user.two_factor_enabled) {
                const twoFactorToken = request.headers['x-2fa-token'];
                if (!twoFactorToken) {
                    throw new common_1.UnauthorizedException('2FA token is required');
                }
                const isValid = await this.userManagementService.verify2FA(user.id, twoFactorToken);
                if (!isValid) {
                    throw new common_1.UnauthorizedException('Invalid 2FA token');
                }
            }
            request['user'] = user;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid authentication token');
        }
        return true;
    }
    extractTokenFromHeader(request) {
        var _a, _b;
        const [type, token] = (_b = (_a = request.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')) !== null && _b !== void 0 ? _b : [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_management_service_1.UserManagementService])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map