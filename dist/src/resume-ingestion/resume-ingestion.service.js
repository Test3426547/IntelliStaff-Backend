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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ResumeIngestionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeIngestionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const amqp = __importStar(require("amqplib"));
const nodemailer = __importStar(require("nodemailer"));
const simpleParser = __importStar(require("mailparser"));
const terminus_1 = require("@nestjs/terminus");
let ResumeIngestionService = ResumeIngestionService_1 = class ResumeIngestionService extends terminus_1.HealthIndicator {
    constructor(configService) {
        super();
        this.configService = configService;
        this.logger = new common_1.Logger(ResumeIngestionService_1.name);
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
        this.initializeRabbitMQ();
    }
    async initializeRabbitMQ() {
        try {
            this.rabbitmqConnection = await amqp.connect(this.configService.get('RABBITMQ_URL'));
            this.rabbitmqChannel = await this.rabbitmqConnection.createChannel();
            await this.rabbitmqChannel.assertQueue('resume_ingestion', { durable: true });
            this.logger.log('RabbitMQ connection established');
        }
        catch (error) {
            this.logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
        }
    }
    async uploadResume(file) {
        try {
            if (!file) {
                throw new common_1.BadRequestException('No file uploaded');
            }
            const { data, error } = await this.supabase.storage
                .from('resumes')
                .upload(`${Date.now()}_${file.originalname}`, file.buffer, {
                contentType: file.mimetype,
            });
            if (error) {
                throw new Error(`Failed to upload resume to Supabase Storage: ${error.message}`);
            }
            const resumeUrl = data.path;
            await this.rabbitmqChannel.sendToQueue('resume_ingestion', Buffer.from(JSON.stringify({ resumeUrl })));
            return resumeUrl;
        }
        catch (error) {
            this.logger.error(`Error in uploadResume: ${error.message}`);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to upload resume');
        }
    }
    async getResumes(page = 1, limit = 10) {
        try {
            const { data, error, count } = await this.supabase
                .from('resumes')
                .select('*', { count: 'exact' })
                .range((page - 1) * limit, page * limit - 1);
            if (error) {
                throw new Error(`Failed to fetch resumes: ${error.message}`);
            }
            const resumesWithUrls = await Promise.all(data.map(async (resume) => {
                const { data: urlData } = await this.supabase.storage
                    .from('resumes')
                    .createSignedUrl(resume.file_path, 3600);
                return Object.assign(Object.assign({}, resume), { signedUrl: urlData.signedUrl });
            }));
            return { resumes: resumesWithUrls, total: count };
        }
        catch (error) {
            this.logger.error(`Error fetching resumes: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to fetch resumes');
        }
    }
    async ingestResumeFromEmail(email) {
        try {
            const transporter = nodemailer.createTransport({
                host: this.configService.get('SMTP_HOST'),
                port: this.configService.get('SMTP_PORT'),
                secure: false,
                auth: {
                    user: this.configService.get('SMTP_USER'),
                    pass: this.configService.get('SMTP_PASSWORD'),
                },
            });
            const fetchedEmails = await transporter.fetchMail({
                from: email,
                unseen: true,
                limit: 10,
            });
            for (const mail of fetchedEmails) {
                const parsed = await simpleParser(mail.content);
                if (parsed.attachments && parsed.attachments.length > 0) {
                    for (const attachment of parsed.attachments) {
                        if (this.isResumeFile(attachment.filename)) {
                            const resumeBuffer = Buffer.from(attachment.content);
                            const resumeUrl = await this.uploadResume({
                                buffer: resumeBuffer,
                                originalname: attachment.filename,
                                mimetype: attachment.contentType,
                            });
                            await this.rabbitmqChannel.sendToQueue('resume_ingestion', Buffer.from(JSON.stringify({ resumeUrl })));
                        }
                    }
                }
            }
        }
        catch (error) {
            this.logger.error(`Error ingesting resume from email: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to ingest resume from email');
        }
    }
    isResumeFile(filename) {
        const allowedExtensions = ['.pdf', '.doc', '.docx'];
        return allowedExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    }
    async checkHealth() {
        try {
            const { data, error } = await this.supabase.from('resumes').select('id').limit(1);
            if (error)
                throw error;
            return this.getStatus('resume_ingestion_db', true, { message: 'Resume Ingestion DB is healthy' });
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error.message}`);
            throw new terminus_1.HealthCheckError('Resume Ingestion DB check failed', error);
        }
    }
};
exports.ResumeIngestionService = ResumeIngestionService;
exports.ResumeIngestionService = ResumeIngestionService = ResumeIngestionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ResumeIngestionService);
//# sourceMappingURL=resume-ingestion.service.js.map