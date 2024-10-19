import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { retry } from 'rxjs/operators';
import { from } from 'rxjs';

@Injectable()
export class ApplicantMatchingService extends HealthIndicator {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(ApplicantMatchingService.name);

  constructor(private configService: ConfigService) {
    super();
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
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
    return from(operation()).pipe(
      retry({
        count: maxRetries,
        delay: (error, retryCount) => {
          this.logger.warn(`Retrying operation. Attempt ${retryCount} of ${maxRetries}`);
          return Math.pow(2, retryCount) * 1000; // Exponential backoff
        }
      })
    ).toPromise();
  }

  async matchApplicantToJob(applicantId: string, jobId: string): Promise<any> {
    return this.retryOperation(async () => {
      try {
        const { data, error } = await this.supabase
          .from('applicant_matches')
          .insert({ applicant_id: applicantId, job_id: jobId })
          .single();

        if (error) throw new Error(`Failed to match applicant to job: ${error.message}`);
        return data;
      } catch (error) {
        this.logger.error(`Error matching applicant to job: ${error.message}`);
        throw new InternalServerErrorException('Failed to match applicant to job');
      }
    });
  }

  async getMatchesForApplicant(applicantId: string): Promise<any[]> {
    return this.retryOperation(async () => {
      try {
        const { data, error } = await this.supabase
          .from('applicant_matches')
          .select('*')
          .eq('applicant_id', applicantId);

        if (error) throw new Error(`Failed to get matches for applicant: ${error.message}`);
        return data;
      } catch (error) {
        this.logger.error(`Error getting matches for applicant: ${error.message}`);
        throw new InternalServerErrorException('Failed to get matches for applicant');
      }
    });
  }

  async getMatchesForJob(jobId: string): Promise<any[]> {
    return this.retryOperation(async () => {
      try {
        const { data, error } = await this.supabase
          .from('applicant_matches')
          .select('*')
          .eq('job_id', jobId);

        if (error) throw new Error(`Failed to get matches for job: ${error.message}`);
        return data;
      } catch (error) {
        this.logger.error(`Error getting matches for job: ${error.message}`);
        throw new InternalServerErrorException('Failed to get matches for job');
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
        throw new InternalServerErrorException('Failed to remove match');
      }
    });
  }
}
