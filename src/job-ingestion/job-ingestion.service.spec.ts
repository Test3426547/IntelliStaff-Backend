import { Test, TestingModule } from '@nestjs/testing';
import { JobIngestionService } from './job-ingestion.service';
import { ConfigService } from '@nestjs/config';
import { WebScraperService } from './web-scraper.service';
import { JobProcessingService } from '../job-processing/job-processing.service';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

describe('JobIngestionService', () => {
  let service: JobIngestionService;
  let mockWebScraperService: Partial<WebScraperService>;
  let mockJobProcessingService: Partial<JobProcessingService>;
  let mockSupabaseClient: any;

  beforeEach(async () => {
    mockWebScraperService = {
      scrapeJobs: jest.fn(),
    };

    mockJobProcessingService = {
      processJobs: jest.fn(),
    };

    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobIngestionService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-value'),
          },
        },
        {
          provide: WebScraperService,
          useValue: mockWebScraperService,
        },
        {
          provide: JobProcessingService,
          useValue: mockJobProcessingService,
        },
      ],
    }).compile();

    service = module.get<JobIngestionService>(JobIngestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ingestJobs', () => {
    it('should ingest jobs successfully', async () => {
      const mockScrapedJobs = [
        { title: 'Job 1', company: 'Company 1', description: 'Description 1' },
        { title: 'Job 2', company: 'Company 2', description: 'Description 2' },
      ];

      mockWebScraperService.scrapeJobs = jest.fn().mockResolvedValue(mockScrapedJobs);
      mockSupabaseClient.single.mockResolvedValue({ data: null, error: null });
      mockSupabaseClient.insert.mockResolvedValue({ data: [{ id: 'job-id' }], error: null });

      await service.ingestJobs('https://example.com', 2);

      expect(mockWebScraperService.scrapeJobs).toHaveBeenCalledWith('https://example.com');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('jobs');
      expect(mockSupabaseClient.insert).toHaveBeenCalledTimes(2);
      expect(mockJobProcessingService.processJobs).toHaveBeenCalledWith(['job-id', 'job-id']);
    });

    it('should handle errors during job ingestion', async () => {
      mockWebScraperService.scrapeJobs = jest.fn().mockRejectedValue(new Error('Scraping failed'));

      await expect(service.ingestJobs('https://example.com')).rejects.toThrow('Job ingestion failed: Scraping failed');
    });
  });

  // Add more test cases for other methods as needed
});
