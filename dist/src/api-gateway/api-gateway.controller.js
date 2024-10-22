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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayController = void 0;
const common_1 = require("@nestjs/common");
const api_gateway_service_1 = require("./api-gateway.service");
const auth_guard_1 = require("../user-management/auth.guard");
const throttler_1 = require("@nestjs/throttler");
let ApiGatewayController = class ApiGatewayController {
    constructor(apiGatewayService) {
        this.apiGatewayService = apiGatewayService;
    }
    async handleRequest(req, res) {
        const serviceName = this.getServiceName(req.path);
        const serviceUrl = this.apiGatewayService.getServiceUrl(serviceName);
        const proxy = this.apiGatewayService.createProxyMiddleware(serviceUrl);
        proxy(req, res, (err) => {
            if (err) {
                this.handleProxyError(err, res);
            }
        });
    }
    getServiceName(path) {
        const parts = path.split('/');
        return parts[2] || 'default';
    }
    handleProxyError(err, res) {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.ApiGatewayController = ApiGatewayController;
__decorate([
    (0, common_1.All)('*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ApiGatewayController.prototype, "handleRequest", null);
exports.ApiGatewayController = ApiGatewayController = __decorate([
    (0, common_1.Controller)('api/v1'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, throttler_1.ThrottlerGuard),
    __metadata("design:paramtypes", [api_gateway_service_1.ApiGatewayService])
], ApiGatewayController);
//# sourceMappingURL=api-gateway.controller.js.map