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
exports.EmailParserService = void 0;
const common_1 = require("@nestjs/common");
const simpleParser = __importStar(require("mailparser"));
let EmailParserService = class EmailParserService {
    async extractResumeFromEmail(emailContent) {
        try {
            const parsed = await simpleParser(emailContent);
            if (parsed.attachments && parsed.attachments.length > 0) {
                const resumeAttachment = parsed.attachments.find(attachment => attachment.filename.toLowerCase().includes('resume') ||
                    attachment.filename.toLowerCase().includes('cv'));
                if (resumeAttachment) {
                    return resumeAttachment.content.toString('utf-8');
                }
            }
            return parsed.text || '';
        }
        catch (error) {
            throw new Error(`Failed to parse email: ${error.message}`);
        }
    }
};
exports.EmailParserService = EmailParserService;
exports.EmailParserService = EmailParserService = __decorate([
    (0, common_1.Injectable)()
], EmailParserService);
//# sourceMappingURL=email-parser.service.js.map