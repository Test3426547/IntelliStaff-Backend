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
var EventService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
let EventService = EventService_1 = class EventService {
    constructor(client) {
        this.client = client;
        this.logger = new common_1.Logger(EventService_1.name);
    }
    async publish(eventType, data, retries = 3) {
        try {
            await (0, rxjs_1.lastValueFrom)((0, rxjs_1.from)(Array(retries).fill(0)).pipe((0, operators_1.mergeMap)(() => this.client.emit(eventType, data)), (0, operators_1.catchError)((error, caught) => {
                if (caught.count < retries - 1) {
                    this.logger.warn(`Failed to publish event: ${eventType}. Retrying...`);
                    return caught;
                }
                this.logger.error(`Failed to publish event: ${eventType}`, error.stack);
                return (0, rxjs_1.throwError)(() => new Error(`Failed to publish event after ${retries} retries: ${eventType}`));
            })));
            this.logger.log(`Event published: ${eventType}`);
        }
        catch (error) {
            this.logger.error(`Failed to publish event: ${eventType}`, error.stack);
            throw error;
        }
    }
    subscribe(eventType) {
        this.logger.log(`Subscribing to event: ${eventType}`);
        return this.client.send(eventType, {}).pipe((0, operators_1.catchError)((error) => {
            this.logger.error(`Failed to subscribe to event: ${eventType}`, error.stack);
            return (0, rxjs_1.throwError)(() => new Error(`Failed to subscribe to event: ${eventType}`));
        }));
    }
    async handleIncomingMessage(eventType, handler) {
        this.client.send(eventType, {}).subscribe({
            next: async (data) => {
                try {
                    await handler(data);
                    this.logger.log(`Handled incoming message for event: ${eventType}`);
                }
                catch (error) {
                    this.logger.error(`Error handling incoming message for event: ${eventType}`, error.stack);
                }
            },
            error: (error) => {
                this.logger.error(`Error receiving message for event: ${eventType}`, error.stack);
            }
        });
    }
};
exports.EventService = EventService;
exports.EventService = EventService = EventService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_2.Inject)('RABBIT_MQ_CLIENT')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], EventService);
//# sourceMappingURL=event.service.js.map