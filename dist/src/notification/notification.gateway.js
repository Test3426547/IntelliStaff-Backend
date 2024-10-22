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
var NotificationGateway_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let NotificationGateway = NotificationGateway_1 = class NotificationGateway {
    constructor() {
        this.logger = new common_1.Logger(NotificationGateway_1.name);
        this.userSockets = new Map();
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        for (const [userId, socket] of this.userSockets.entries()) {
            if (socket === client) {
                this.userSockets.delete(userId);
                break;
            }
        }
    }
    handleRegister(client, userId) {
        this.userSockets.set(userId, client);
        this.logger.log(`User ${userId} registered`);
    }
    sendNotificationToUser(userId, notification) {
        const userSocket = this.userSockets.get(userId);
        if (userSocket) {
            userSocket.emit('notification', notification);
        }
    }
};
exports.NotificationGateway = NotificationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", typeof (_a = typeof socket_io_1.Server !== "undefined" && socket_io_1.Server) === "function" ? _a : Object)
], NotificationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('register'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _b : Object, String]),
    __metadata("design:returntype", void 0)
], NotificationGateway.prototype, "handleRegister", null);
exports.NotificationGateway = NotificationGateway = NotificationGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], NotificationGateway);
//# sourceMappingURL=notification.gateway.js.map