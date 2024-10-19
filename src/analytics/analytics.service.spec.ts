import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { DatabaseSetupService } from './database-setup';

jest.mock('@supabase/supabase-js');

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockSupabaseClient: any;
  let mockDatabaseSetupService: Partial<DatabaseSetupService>;

  beforeEach(async () => {
    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    mockDatabaseSetupService = {
      setupDatabase: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-value'),
          },
        },
        {
          provide: DatabaseSetupService,
          useValue: mockDatabaseSetupService,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getJobPostingStats', () => {
    it('should return job posting statistics', async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const mockJobData = [
        { id: '1', title: 'Job 1', postedDate: new Date().toISOString(), lastRelistedDate: null },
        { id: '2', title: 'Job 2', postedDate: thirtyDaysAgo.toISOString(), lastRelistedDate: new Date().toISOString() },
        { id: '3', title: 'Job 3', postedDate: new Date(thirtyDaysAgo.getTime() - 86400000).toISOString(), lastRelistedDate: null },
      ];
      mockSupabaseClient.select.mockResolvedValue({ data: mockJobData, error: null });

      const result = await service.getJobPostingStats();

      expect(result).toEqual({
        totalJobs: 3,
        recentJobs: 2,
        relistedJobs: 1,
      });
    });
  });

  describe('getApplicantStats', () => {
    it('should return applicant statistics', async () => {
      const mockApplicantData = [
        { id: '1', name: 'John Doe', skills: ['JavaScript', 'React'] },
        { id: '2', name: 'Jane Smith', skills: ['Python', 'React'] },
      ];
      mockSupabaseClient.select.mockResolvedValue({ data: mockApplicantData, error: null });

      const result = await service.getApplicantStats();

      expect(result).toEqual({
        totalApplicants: 2,
        topSkills: [
          { skill: 'React', count: 2 },
          { skill: 'JavaScript', count: 1 },
          { skill: 'Python', count: 1 },
        ],
      });
    });
  });

  describe('getMatchingInsights', () => {
    it('should return matching insights', async () => {
      const mockMatchData = [
        { applicant_id: '1', job_id: 'a', match_score: 0.8 },
        { applicant_id: '2', job_id: 'b', match_score: 0.6 },
      ];
      mockSupabaseClient.select.mockResolvedValue({ data: mockMatchData, error: null });

      const result = await service.getMatchingInsights();

      expect(result).toEqual({
        totalMatches: 2,
        averageMatchScore: 0.7,
        matchDistribution: {
          '60-69': 1,
          '80-89': 1,
        },
        topMatches: [
          { applicant_id: '1', job_id: 'a', match_score: 0.8 },
          { applicant_id: '2', job_id: 'b', match_score: 0.6 },
        ],
      });
    });
  });
});
