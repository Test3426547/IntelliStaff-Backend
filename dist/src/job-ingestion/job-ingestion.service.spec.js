"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const job_ingestion_service_1 = require("./job-ingestion.service");
const config_1 = require("@nestjs/config");
const web_scraper_service_1 = require("./web-scraper.service");
const job_processing_service_1 = require("../job-processing/job-processing.service");
const supabase_js_1 = require("@supabase/supabase-js");
jest.mock('@supabase/supabase-js');
describe('JobIngestionService', () => {
    let service;
    let mockWebScraperService;
    let mockJobProcessingService;
    let mockSupabaseClient;
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
        supabase_js_1.createClient.mockReturnValue(mockSupabaseClient);
        const module = await testing_1.Test.createTestingModule({
            providers: [
                job_ingestion_service_1.JobIngestionService,
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('mock-value'),
                    },
                },
                {
                    provide: web_scraper_service_1.WebScraperService,
                    useValue: mockWebScraperService,
                },
                {
                    provide: job_processing_service_1.JobProcessingService,
                    useValue: mockJobProcessingService,
                },
            ],
        }).compile();
        service = module.get(job_ingestion_service_1.JobIngestionService);
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
});
//# sourceMappingURL=job-ingestion.service.spec.js.map