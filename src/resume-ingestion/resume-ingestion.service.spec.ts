import { Test, TestingModule } from '@nestjs/testing';
import { ResumeIngestionService } from './resume-ingestion.service';
import { ConfigService } from '@nestjs/config';
import { EmailParserService } from './email-parser.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

jest.mock('@supabase/supabase-js');
jest.mock('pdf-parse/lib/pdf-parse', () => {
  return jest.fn().mockImplementation(() => {
    return Promise.resolve({ text: 'Mocked PDF content' });
  });
});
jest.mock('mammoth', () => ({
  extractRawText: jest.fn().mockResolvedValue({ value: 'Mocked DOCX content' }),
}));
jest.mock('nodemailer');

describe('ResumeIngestionService', () => {
  let service: ResumeIngestionService;
  let mockSupabaseClient: any;
  let mockConfigService: Partial<ConfigService>;
  let mockEmailParserService: Partial<EmailParserService>;

  beforeEach(async () => {
    mockSupabaseClient = {
      storage: {
        from: jest.fn().mockReturnThis(),
        upload: jest.fn().mockResolvedValue({ data: { path: 'mocked-path' }, error: null }),
        createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'mocked-signed-url' }, error: null }),
      },
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      select: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        const config = {
          SUPABASE_URL: 'https://example.supabase.co',
          SUPABASE_KEY: 'mock-key',
          SMTP_HOST: 'smtp.example.com',
          SMTP_PORT: 587,
          SMTP_USER: 'user@example.com',
          SMTP_PASSWORD: 'password',
          EMAIL_FROM: 'noreply@example.com',
        };
        return config[key];
      }),
    };

    mockEmailParserService = {
      extractResumeFromEmail: jest.fn().mockResolvedValue('Mocked email content'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeIngestionService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EmailParserService, useValue: mockEmailParserService },
      ],
    }).compile();

    service = module.get<ResumeIngestionService>(ResumeIngestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadResume', () => {
    it('should upload a resume successfully', async () => {
      const mockFile = {
        buffer: Buffer.from('mock resume content'),
        originalname: 'resume.pdf',
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      const result = await service.uploadResume(mockFile);

      expect(result).toBe('mocked-path');
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('resumes');
      expect(mockSupabaseClient.storage.upload).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('processed_resumes');
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid file upload', async () => {
      await expect(service.uploadResume(null)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException when Supabase upload fails', async () => {
      const mockFile = {
        buffer: Buffer.from('mock resume content'),
        originalname: 'resume.pdf',
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      mockSupabaseClient.storage.upload.mockResolvedValueOnce({ data: null, error: new Error('Upload failed') });

      await expect(service.uploadResume(mockFile)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getResumes', () => {
    it('should return resumes with signed URLs', async () => {
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: [{ id: 1, file_path: 'resumes/123-resume.pdf' }],
        error: null,
        count: 1,
      });

      const result = await service.getResumes();

      expect(result.resumes[0].fileUrl).toBe('mocked-signed-url');
      expect(result.totalCount).toBe(1);
    });

    it('should handle errors when fetching resumes', async () => {
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: null,
        error: new Error('Fetch failed'),
        count: null,
      });

      await expect(service.getResumes()).rejects.toThrow(InternalServerErrorException);
    });
  });

  // Add more tests for other methods like ingestResumeFromEmail, sendConfirmationEmail, etc.
});
