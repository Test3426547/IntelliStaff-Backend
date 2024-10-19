import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import * as NodeCache from 'node-cache';
import axios from 'axios';

@Injectable()
export class AnalyticsService extends HealthIndicator {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(AnalyticsService.name);
  private cache: NodeCache;
  private huggingfaceApiKey: string;
  private huggingfaceInferenceEndpoint: string;

  constructor(private configService: ConfigService) {
    super();
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes
    this.huggingfaceApiKey = this.configService.get<string>('HUGGINGFACE_API_KEY');
    this.huggingfaceInferenceEndpoint = this.configService.get<string>('HUGGINGFACE_INFERENCE_ENDPOINT');
  }

  async checkHealth(): Promise<HealthIndicatorResult> {
    try {
      const { data, error } = await this.supabase.from('jobs').select('id').limit(1);
      if (error) throw error;
      return this.getStatus('analytics_service_db', true, { message: 'Analytics Service DB is healthy' });
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      throw new HealthCheckError('Analytics Service DB check failed', error);
    }
  }

  async getJobPostingStats(timeRange: string): Promise<any> {
    const cacheKey = `jobPostingStats_${timeRange}`;
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const { data, error } = await this.supabase
        .from('jobs')
        .select('*')
        .gte('created_at', this.getDateFromTimeRange(timeRange));

      if (error) throw new Error(`Failed to fetch job posting stats: ${error.message}`);

      const stats = {
        totalJobs: data.length,
        activeJobs: data.filter(job => job.status === 'active').length,
        averageSalary: this.calculateAverageSalary(data),
        topCategories: this.getTopCategories(data),
      };

      this.cache.set(cacheKey, stats);
      return stats;
    } catch (error) {
      this.logger.error(`Error getting job posting stats: ${error.message}`);
      throw new InternalServerErrorException('Failed to get job posting stats');
    }
  }

  async getApplicantStats(timeRange: string): Promise<any> {
    const cacheKey = `applicantStats_${timeRange}`;
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const { data, error } = await this.supabase
        .from('applicants')
        .select('*, resumes(*)')
        .gte('created_at', this.getDateFromTimeRange(timeRange));

      if (error) throw new Error(`Failed to fetch applicant stats: ${error.message}`);

      const stats = {
        totalApplicants: data.length,
        averageExperience: this.calculateAverageExperience(data),
        topSkills: await this.getTopSkills(data),
        educationDistribution: this.getEducationDistribution(data),
      };

      this.cache.set(cacheKey, stats);
      return stats;
    } catch (error) {
      this.logger.error(`Error getting applicant stats: ${error.message}`);
      throw new InternalServerErrorException('Failed to get applicant stats');
    }
  }

  async getMatchingInsights(timeRange: string): Promise<any> {
    const cacheKey = `matchingInsights_${timeRange}`;
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const { data, error } = await this.supabase
        .from('applicant_matches')
        .select('*, jobs(*), applicants(*)')
        .gte('created_at', this.getDateFromTimeRange(timeRange));

      if (error) throw new Error(`Failed to fetch matching insights: ${error.message}`);

      const insights = {
        totalMatches: data.length,
        averageMatchScore: this.calculateAverageMatchScore(data),
        topMatchingJobs: this.getTopMatchingJobs(data),
        skillGapAnalysis: await this.performSkillGapAnalysis(data),
      };

      this.cache.set(cacheKey, insights);
      return insights;
    } catch (error) {
      this.logger.error(`Error getting matching insights: ${error.message}`);
      throw new InternalServerErrorException('Failed to get matching insights');
    }
  }

  async getRecruitmentFunnelAnalysis(timeRange: string): Promise<any> {
    const cacheKey = `recruitmentFunnelAnalysis_${timeRange}`;
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const jobsData = await this.supabase
        .from('jobs')
        .select('id, created_at')
        .gte('created_at', this.getDateFromTimeRange(timeRange));

      const applicantsData = await this.supabase
        .from('applicants')
        .select('id, created_at')
        .gte('created_at', this.getDateFromTimeRange(timeRange));

      const matchesData = await this.supabase
        .from('applicant_matches')
        .select('id, created_at')
        .gte('created_at', this.getDateFromTimeRange(timeRange));

      const hiresData = await this.supabase
        .from('hires')
        .select('id, created_at')
        .gte('created_at', this.getDateFromTimeRange(timeRange));

      if (jobsData.error || applicantsData.error || matchesData.error || hiresData.error) {
        throw new Error('Failed to fetch recruitment funnel data');
      }

      const analysis = {
        jobPostings: jobsData.data.length,
        applicants: applicantsData.data.length,
        matches: matchesData.data.length,
        hires: hiresData.data.length,
        conversionRates: {
          applicantToMatch: (matchesData.data.length / applicantsData.data.length) * 100,
          matchToHire: (hiresData.data.length / matchesData.data.length) * 100,
          overallConversion: (hiresData.data.length / applicantsData.data.length) * 100,
        },
      };

      this.cache.set(cacheKey, analysis);
      return analysis;
    } catch (error) {
      this.logger.error(`Error getting recruitment funnel analysis: ${error.message}`);
      throw new InternalServerErrorException('Failed to get recruitment funnel analysis');
    }
  }

  async getMarketTrendsAnalysis(): Promise<any> {
    const cacheKey = 'marketTrendsAnalysis';
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const prompt = `Analyze current job market trends based on the following data:
        1. Top in-demand skills
        2. Emerging job titles
        3. Salary trends
        4. Industry growth areas
        
        Provide a concise summary of the key trends and their implications for the job market.`;

      const response = await axios.post(
        this.huggingfaceInferenceEndpoint,
        { inputs: prompt },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingfaceApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const analysis = response.data[0].generated_text.trim();
      this.cache.set(cacheKey, analysis, 86400); // Cache for 24 hours
      return analysis;
    } catch (error) {
      this.logger.error(`Error getting market trends analysis: ${error.message}`);
      throw new InternalServerErrorException('Failed to get market trends analysis');
    }
  }

  private getDateFromTimeRange(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case 'day':
        return new Date(now.setDate(now.getDate() - 1));
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        throw new Error('Invalid time range');
    }
  }

  private calculateAverageSalary(jobs: any[]): number {
    const salaries = jobs.filter(job => job.salary).map(job => job.salary);
    return salaries.length > 0 ? salaries.reduce((a, b) => a + b) / salaries.length : 0;
  }

  private getTopCategories(jobs: any[]): { category: string, count: number }[] {
    const categories = jobs.map(job => job.category);
    const categoryCounts = categories.reduce((acc, category) => {
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculateAverageExperience(applicants: any[]): number {
    const experiences = applicants.filter(applicant => applicant.years_of_experience).map(applicant => applicant.years_of_experience);
    return experiences.length > 0 ? experiences.reduce((a, b) => a + b) / experiences.length : 0;
  }

  private async getTopSkills(applicants: any[]): Promise<{ skill: string, count: number }[]> {
    const allSkills = applicants.flatMap(applicant => applicant.skills || []);
    const skillCounts = allSkills.reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getEducationDistribution(applicants: any[]): { level: string, count: number }[] {
    const educationLevels = applicants.map(applicant => applicant.education_level);
    const levelCounts = educationLevels.reduce((acc, level) => {
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(levelCounts)
      .map(([level, count]) => ({ level, count: count as number }))
      .sort((a, b) => b.count - a.count);
  }

  private calculateAverageMatchScore(matches: any[]): number {
    const scores = matches.map(match => match.match_score);
    return scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0;
  }

  private getTopMatchingJobs(matches: any[]): { jobTitle: string, matchCount: number }[] {
    const jobMatches = matches.reduce((acc, match) => {
      const jobTitle = match.jobs.title;
      acc[jobTitle] = (acc[jobTitle] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(jobMatches)
      .map(([jobTitle, matchCount]) => ({ jobTitle, matchCount: matchCount as number }))
      .sort((a, b) => b.matchCount - a.matchCount)
      .slice(0, 5);
  }

  private async performSkillGapAnalysis(matches: any[]): Promise<any> {
    const jobSkills = matches.flatMap(match => match.jobs.required_skills || []);
    const applicantSkills = matches.flatMap(match => match.applicants.skills || []);

    const missingSkills = jobSkills.filter(skill => !applicantSkills.includes(skill));
    const skillGapCount = missingSkills.reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});

    const topSkillGaps = Object.entries(skillGapCount)
      .map(([skill, count]) => ({ skill, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const prompt = `Based on the following top skill gaps in job matches, provide recommendations for addressing these gaps:
      ${topSkillGaps.map(gap => `${gap.skill}: ${gap.count} occurrences`).join('\n')}
      
      Provide concise recommendations for:
      1. How job seekers can acquire these skills
      2. How employers can adapt their job requirements or provide training
      3. Potential partnerships or programs to bridge these skill gaps`;

    try {
      const response = await axios.post(
        this.huggingfaceInferenceEndpoint,
        { inputs: prompt },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingfaceApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        topSkillGaps,
        recommendations: response.data[0].generated_text.trim(),
      };
    } catch (error) {
      this.logger.error(`Error performing skill gap analysis: ${error.message}`);
      return { topSkillGaps, recommendations: 'Unable to generate recommendations at this time.' };
    }
  }
}
