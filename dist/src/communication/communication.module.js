"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const communication_service_1 = require("./communication.service");
const communication_controller_1 = require("./communication.controller");
const terminus_1 = require("@nestjs/terminus");
const admin = __importStar(require("firebase-admin"));
const sgMail = __importStar(require("@sendgrid/mail"));
const twilio = __importStar(require("twilio"));
const Handlebars = __importStar(require("handlebars"));
const schedule_1 = require("@nestjs/schedule");
let CommunicationModule = class CommunicationModule {
};
exports.CommunicationModule = CommunicationModule;
exports.CommunicationModule = CommunicationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            terminus_1.TerminusModule,
            schedule_1.ScheduleModule.forRoot(),
        ],
        providers: [
            communication_service_1.CommunicationService,
            {
                provide: 'FIREBASE_ADMIN',
                useFactory: (configService) => {
                    const firebaseConfig = {
                        projectId: configService.get('FIREBASE_PROJECT_ID'),
                        clientEmail: configService.get('FIREBASE_CLIENT_EMAIL'),
                        privateKey: configService.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
                    };
                    return admin.initializeApp({ credential: admin.credential.cert(firebaseConfig) });
                },
                inject: [config_1.ConfigService],
            },
            {
                provide: 'SENDGRID',
                useFactory: (configService) => {
                    sgMail.setApiKey(configService.get('SENDGRID_API_KEY'));
                    return sgMail;
                },
                inject: [config_1.ConfigService],
            },
            {
                provide: 'TWILIO',
                useFactory: (configService) => {
                    const accountSid = configService.get('TWILIO_ACCOUNT_SID');
                    const authToken = configService.get('TWILIO_AUTH_TOKEN');
                    return twilio(accountSid, authToken);
                },
                inject: [config_1.ConfigService],
            },
            {
                provide: 'HANDLEBARS',
                useValue: Handlebars,
            },
        ],
        controllers: [communication_controller_1.CommunicationController],
        exports: [communication_service_1.CommunicationService],
    })
], CommunicationModule);
//# sourceMappingURL=communication.module.js.map