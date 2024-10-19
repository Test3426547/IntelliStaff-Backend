import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EmailParserService } from './email-parser.service';
import * as nodemailer from 'nodemailer';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

@Injectable()
export class ResumeIngestionService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(ResumeIngestionService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private emailParserService: EmailParserService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.initializeEmailTransporter();
  }

  private initializeEmailTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: true,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async uploadResume(file: Express.Multer.File): Promise<string> {
    try {
      if (!file || !file.buffer) {
        throw new BadRequestException('Invalid file upload');
      }

      const fileName = `${Date.now()}-${file.originalname}`;
      const { data, error } = await this.supabase.storage
        .from('resumes')
        .upload(fileName, file.buffer, {
          upsert: true,
          contentType: file.mimetype,
        });

      if (error) {
        this.logger.error(`Failed to upload resume to Supabase Storage: ${error.message}`);
        throw new InternalServerErrorException('Failed to upload resume');
      }

      this.logger.log(`Resume uploaded successfully to Supabase Storage: ${data.path}`);
      
      const extractedText = await this.extractTextFromFile(file);
      await this.storeResumeMetadata(data.path, extractedText);

      return data.path;
    } catch (error) {
      this.logger.error(`Error in uploadResume: ${error.message}`);
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred while uploading the resume');
    }
  }

  private async extractTextFromFile(file: Express.Multer.File): Promise<string> {
    try {
      const fileExtension = file.originalname.split('.').pop().toLowerCase();
      let text = '';

      switch (fileExtension) {
        case 'pdf':
          const pdfData = await pdfParse(file.buffer);
          text = pdfData.text;
          break;
        case 'doc':
        case 'docx':
          const result = await mammoth.extractRawText({ buffer: file.buffer });
          text = result.value;
          break;
        case 'txt':
          text = file.buffer.toString('utf-8');
          break;
        default:
          throw new BadRequestException('Unsupported file format');
      }

      return text;
    } catch (error) {
      this.logger.error(`Error extracting text from file: ${error.message}`);
      throw new BadRequestException('Failed to extract text from the file');
    }
  }

  private async storeResumeMetadata(path: string, extractedText: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('processed_resumes')
        .insert({
          file_path: path,
          extracted_text: extractedText,
          created_at: new Date().toISOString(),
        });

      if (error) {
        throw new Error(`Failed to store resume metadata: ${error.message}`);
      }
    } catch (error) {
      this.logger.error(`Error storing resume metadata: ${error.message}`);
      throw new InternalServerErrorException('Failed to store resume metadata');
    }
  }

  async ingestResumeFromEmail(email: string): Promise<string> {
    try {
      const resumeContent = await this.emailParserService.extractResumeFromEmail(email);
      const fileName = `${Date.now()}-parsed-resume.txt`;

      const { data, error } = await this.supabase.storage
        .from('resumes')
        .upload(fileName, Buffer.from(resumeContent), {
          upsert: true,
          contentType: 'text/plain',
        });

      if (error) {
        this.logger.error(`Failed to store parsed resume in Supabase Storage: ${error.message}`);
        throw new InternalServerErrorException('Failed to store parsed resume');
      }

      this.logger.log(`Resume ingested from email and stored in Supabase Storage: ${data.path}`);
      await this.storeResumeMetadata(data.path, resumeContent);
      return data.path;
    } catch (error) {
      this.logger.error(`Failed to ingest resume from email: ${error.message}`);
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred while ingesting the resume from email');
    }
  }

  async getResumes(page: number = 1, pageSize: number = 10): Promise<{ resumes: any[], totalCount: number }> {
    try {
      const { data, error, count } = await this.supabase
        .from('processed_resumes')
        .select('*', { count: 'exact' })
        .range((page - 1) * pageSize, page * pageSize - 1)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch resumes: ${error.message}`);
      }

      const resumes = await Promise.all(data.map(async (resume) => {
        const { data: fileData, error: fileError } = await this.supabase.storage
          .from('resumes')
          .createSignedUrl(resume.file_path, 60); // Create a signed URL valid for 60 seconds

        if (fileError) {
          this.logger.error(`Failed to create signed URL for resume ${resume.file_path}: ${fileError.message}`);
          return { ...resume, fileUrl: null };
        }

        return { ...resume, fileUrl: fileData.signedUrl };
      }));

      return { resumes, totalCount: count };
    } catch (error) {
      this.logger.error(`Error fetching resumes: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch resumes');
    }
  }

  async sendConfirmationEmail(to: string, resumePath: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'),
      to: to,
      subject: 'Resume Received Confirmation',
      text: `Thank you for submitting your resume. Your resume has been successfully received and stored with the reference: ${resumePath}`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Confirmation email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send confirmation email: ${error.message}`);
      throw new InternalServerErrorException('Failed to send confirmation email');
    }
  }
}
