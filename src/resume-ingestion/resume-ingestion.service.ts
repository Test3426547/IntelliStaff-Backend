import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as amqp from 'amqplib';
import * as nodemailer from 'nodemailer';
import * as simpleParser from 'mailparser';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';

@Injectable()
export class ResumeIngestionService extends HealthIndicator {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(ResumeIngestionService.name);
  private rabbitmqConnection: amqp.Connection;
  private rabbitmqChannel: amqp.Channel;

  constructor(private configService: ConfigService) {
    super();
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.initializeRabbitMQ();
  }

  private async initializeRabbitMQ() {
    try {
      this.rabbitmqConnection = await amqp.connect(this.configService.get<string>('RABBITMQ_URL'));
      this.rabbitmqChannel = await this.rabbitmqConnection.createChannel();
      await this.rabbitmqChannel.assertQueue('resume_ingestion', { durable: true });
      this.logger.log('RabbitMQ connection established');
    } catch (error) {
      this.logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
    }
  }

  async uploadResume(file: Express.Multer.File): Promise<string> {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
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
    } catch (error) {
      this.logger.error(`Error in uploadResume: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload resume');
    }
  }

  async getResumes(page: number = 1, limit: number = 10): Promise<{ resumes: any[], total: number }> {
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
          .createSignedUrl(resume.file_path, 3600); // URL valid for 1 hour

        return { ...resume, signedUrl: urlData.signedUrl };
      }));

      return { resumes: resumesWithUrls, total: count };
    } catch (error) {
      this.logger.error(`Error fetching resumes: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch resumes');
    }
  }

  async ingestResumeFromEmail(email: string): Promise<void> {
    try {
      const transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST'),
        port: this.configService.get<number>('SMTP_PORT'),
        secure: false,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASSWORD'),
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
              } as Express.Multer.File);

              await this.rabbitmqChannel.sendToQueue('resume_ingestion', Buffer.from(JSON.stringify({ resumeUrl })));
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error ingesting resume from email: ${error.message}`);
      throw new InternalServerErrorException('Failed to ingest resume from email');
    }
  }

  private isResumeFile(filename: string): boolean {
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    return allowedExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  async checkHealth(): Promise<HealthIndicatorResult> {
    try {
      const { data, error } = await this.supabase.from('resumes').select('id').limit(1);
      if (error) throw error;
      return this.getStatus('resume_ingestion_db', true, { message: 'Resume Ingestion DB is healthy' });
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      throw new HealthCheckError('Resume Ingestion DB check failed', error);
    }
  }
}
