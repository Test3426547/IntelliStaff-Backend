import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { retry } from 'rxjs/operators';
import { from } from 'rxjs';

@Injectable()
export class JobService extends HealthIndicator {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(JobService.name);

  constructor(private configService: ConfigService) {
    super();
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
  }

  async checkHealth(): Promise<HealthIndicatorResult> {
    try {
      const { data, error } = await this.supabase.from('jobs').select('id').limit(1);
      if (error) throw error;
      return this.getStatus('job_service_db', true, { message: 'Job Service DB is healthy' });
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      throw new HealthCheckError('Job Service DB check failed', error);
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

  async createJob(jobData: any): Promise<any> {
    return this.retryOperation(async () => {
      try {
        const { data, error } = await this.supabase.from('jobs').insert(jobData).single();
        if (error) throw new Error(`Failed to create job: ${error.message}`);
        return data;
      } catch (error) {
        this.logger.error(`Error creating job: ${error.message}`);
        throw new InternalServerErrorException('Failed to create job');
      }
    });
  }

  async getJob(jobId: string): Promise<any> {
    return this.retryOperation(async () => {
      try {
        const { data, error } = await this.supabase.from('jobs').select('*').eq('id', jobId).single();
        if (error) throw new Error(`Failed to get job: ${error.message}`);
        return data;
      } catch (error) {
        this.logger.error(`Error getting job: ${error.message}`);
        throw new InternalServerErrorException('Failed to get job');
      }
    });
  }

  async updateJob(jobId: string, jobData: any): Promise<any> {
    return this.retryOperation(async () => {
      try {
        const { data, error } = await this.supabase.from('jobs').update(jobData).eq('id', jobId).single();
        if (error) throw new Error(`Failed to update job: ${error.message}`);
        return data;
      } catch (error) {
        this.logger.error(`Error updating job: ${error.message}`);
        throw new InternalServerErrorException('Failed to update job');
      }
    });
  }

  async deleteJob(jobId: string): Promise<void> {
    return this.retryOperation(async () => {
      try {
        const { error } = await this.supabase.from('jobs').delete().eq('id', jobId);
        if (error) throw new Error(`Failed to delete job: ${error.message}`);
      } catch (error) {
        this.logger.error(`Error deleting job: ${error.message}`);
        throw new InternalServerErrorException('Failed to delete job');
      }
    });
  }

  async listJobs(page: number = 1, limit: number = 10): Promise<{ jobs: any[], total: number }> {
    return this.retryOperation(async () => {
      try {
        const { data, error, count } = await this.supabase
          .from('jobs')
          .select('*', { count: 'exact' })
          .range((page - 1) * limit, page * limit - 1);

        if (error) throw new Error(`Failed to list jobs: ${error.message}`);
        return { jobs: data, total: count };
      } catch (error) {
        this.logger.error(`Error listing jobs: ${error.message}`);
        throw new InternalServerErrorException('Failed to list jobs');
      }
    });
  }
}
