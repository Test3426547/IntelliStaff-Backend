import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { CommonUtils } from '../common/common-utils';
import axios from 'axios';

@Injectable()
export class ApplicantMatchingService extends HealthIndicator {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(ApplicantMatchingService.name);
  private huggingfaceApiKey: string;
  private huggingfaceInferenceEndpoint: string;

  constructor(private configService: ConfigService) {
    super();
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.huggingfaceApiKey = this.configService.get<string>('HUGGINGFACE_API_KEY');
    this.huggingfaceInferenceEndpoint = this.configService.get<string>('HUGGINGFACE_INFERENCE_ENDPOINT');
  }

  async checkHealth(): Promise<HealthIndicatorResult> {
    try {
      const { data, error } = await this.supabase.from('applicant_matches').select('id').limit(1);
      if (error) throw error;
      return this.getStatus('applicant_matching_db', true, { message: 'ApplicantMatching Service DB is healthy' });
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      throw new HealthCheckError('ApplicantMatching Service DB check failed', error);
    }
  }

  private async retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    return CommonUtils.retryOperation(operation, maxRetries);
  }

  async matchApplicantToJob(applicantId: string, jobId: string): Promise<any> {
    return this.retryOperation(async () => {
      try {
        const applicant = await this.getApplicant(applicantId);
        const job = await this.getJob(jobId);

        const matchScore = await this.calculateMatchScore(applicant, job);
        const skillMatch = await this.calculateSkillMatch(applicant.skills, job.required_skills);
        const experienceMatch = this.calculateExperienceMatch(applicant.experience, job.required_experience);

        const matchResult = {
          applicant_id: applicantId,
          job_id: jobId,
          match_score: matchScore,
          skill_match: skillMatch,
          experience_match: experienceMatch,
        };

        const { data, error } = await this.supabase
          .from('applicant_matches')
          .insert(matchResult)
          .single();

        if (error) throw new Error(`Failed to match applicant to job: ${error.message}`);
        return data;
      } catch (error) {
        this.logger.error(`Error matching applicant to job: ${error.message}`);
        throw CommonUtils.handleError(error);
      }
    });
  }

  async getMatchesForApplicant(applicantId: string): Promise<any[]> {
    return this.retryOperation(async () => {
      try {
        const { data, error } = await this.supabase
          .from('applicant_matches')
          .select('*, jobs(*)')
          .eq('applicant_id', applicantId)
          .order('match_score', { ascending: false });

        if (error) throw new Error(`Failed to get matches for applicant: ${error.message}`);
        return data;
      } catch (error) {
        this.logger.error(`Error getting matches for applicant: ${error.message}`);
        throw CommonUtils.handleError(error);
      }
    });
  }

  async getMatchesForJob(jobId: string): Promise<any[]> {
    return this.retryOperation(async () => {
      try {
        const { data, error } = await this.supabase
          .from('applicant_matches')
          .select('*, applicants(*)')
          .eq('job_id', jobId)
          .order('match_score', { ascending: false });

        if (error) throw new Error(`Failed to get matches for job: ${error.message}`);
        return data;
      } catch (error) {
        this.logger.error(`Error getting matches for job: ${error.message}`);
        throw CommonUtils.handleError(error);
      }
    });
  }

  async removeMatch(matchId: string): Promise<void> {
    return this.retryOperation(async () => {
      try {
        const { error } = await this.supabase
          .from('applicant_matches')
          .delete()
          .eq('id', matchId);

        if (error) throw new Error(`Failed to remove match: ${error.message}`);
      } catch (error) {
        this.logger.error(`Error removing match: ${error.message}`);
        throw CommonUtils.handleError(error);
      }
    });
  }

  private async getApplicant(applicantId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('applicants')
      .select('*')
      .eq('id', applicantId)
      .single();

    if (error) throw new Error(`Failed to fetch applicant: ${error.message}`);
    return data;
  }

  private async getJob(jobId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) throw new Error(`Failed to fetch job: ${error.message}`);
    return data;
  }

  private async calculateMatchScore(applicant: any, job: any): Promise<number> {
    const prompt = `
      Applicant: ${JSON.stringify(applicant)}
      Job: ${JSON.stringify(job)}
      
      Based on the applicant's profile and the job requirements, calculate a match score between 0 and 100.
      Consider factors such as skills, experience, education, and any other relevant information.
      Provide only the numeric score as the response.
    `;

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

      const score = parseFloat(response.data[0].generated_text.trim());
      return isNaN(score) ? 0 : Math.min(Math.max(score, 0), 100);
    } catch (error) {
      this.logger.error(`Error calculating match score: ${error.message}`);
      return 0;
    }
  }

  private async calculateSkillMatch(applicantSkills: string[], jobSkills: string[]): Promise<number> {
    const prompt = `
      Applicant skills: ${applicantSkills.join(', ')}
      Job required skills: ${jobSkills.join(', ')}
      
      Calculate the skill match percentage between the applicant's skills and the job's required skills.
      Consider both exact matches and related skills. Provide only the numeric percentage as the response.
    `;

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

      const score = parseFloat(response.data[0].generated_text.trim());
      return isNaN(score) ? 0 : Math.min(Math.max(score, 0), 100);
    } catch (error) {
      this.logger.error(`Error calculating skill match: ${error.message}`);
      return 0;
    }
  }

  private calculateExperienceMatch(applicantExperience: number, jobRequiredExperience: number): number {
    if (applicantExperience >= jobRequiredExperience) {
      return 100;
    } else {
      return (applicantExperience / jobRequiredExperience) * 100;
    }
  }

  async generateMatchReport(matchId: string): Promise<string> {
    try {
      const { data: match, error } = await this.supabase
        .from('applicant_matches')
        .select('*, applicants(*), jobs(*)')
        .eq('id', matchId)
        .single();

      if (error) throw new Error(`Failed to fetch match data: ${error.message}`);

      const prompt = `
        Generate a detailed match report for the following applicant and job:
        
        Applicant: ${JSON.stringify(match.applicants)}
        Job: ${JSON.stringify(match.jobs)}
        Match Score: ${match.match_score}
        Skill Match: ${match.skill_match}
        Experience Match: ${match.experience_match}
        
        Provide a comprehensive analysis of the match, including:
        1. Overall suitability of the applicant for the job
        2. Strengths and weaknesses of the applicant in relation to the job requirements
        3. Specific skills that make the applicant a good fit
        4. Areas where the applicant might need additional training or development
        5. Recommendations for the hiring manager
        
        Format the report in a clear and professional manner.
      `;

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

      return response.data[0].generated_text.trim();
    } catch (error) {
      this.logger.error(`Error generating match report: ${error.message}`);
      throw new InternalServerErrorException('Failed to generate match report');
    }
  }
}
