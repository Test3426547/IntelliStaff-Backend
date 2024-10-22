"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventModule = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const config_1 = require("@nestjs/config");
const event_service_1 = require("./event.service");
const event_publisher_service_1 = require("./event-publisher.service");
const event_subscriber_service_1 = require("./event-subscriber.service");
let EventModule = class EventModule {
};
exports.EventModule = EventModule;
exports.EventModule = EventModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            microservices_1.ClientsModule.registerAsync([
                {
                    name: 'RABBIT_MQ_CLIENT',
                    imports: [config_1.ConfigModule],
                    useFactory: (configService) => {
                        const rabbitmqUrl = configService.get('RABBITMQ_URL');
                        if (!rabbitmqUrl) {
                            throw new Error('RABBITMQ_URL is not defined in the environment');
                        }
                        return {
                            transport: microservices_1.Transport.RMQ,
                            options: {
                                urls: [rabbitmqUrl],
                                queue: 'main_queue',
                                queueOptions: {
                                    durable: false
                                },
                            },
                        };
                    },
                    inject: [config_1.ConfigService],
                },
            ]),
        ],
        providers: [event_service_1.EventService, event_publisher_service_1.EventPublisherService, event_subscriber_service_1.EventSubscriberService],
        exports: [event_service_1.EventService, event_publisher_service_1.EventPublisherService, event_subscriber_service_1.EventSubscriberService],
    })
], EventModule);
//# sourceMappingURL=event.module.js.map