import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { retry } from 'rxjs/operators';
import { from } from 'rxjs';

@Injectable()
export class ResumeService extends HealthIndicator {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(ResumeService.name);

  constructor(private configService: ConfigService) {
    super();
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
  }

  async checkHealth(): Promise<HealthIndicatorResult> {
    try {
      const { data, error } = await this.supabase.from('resumes').select('id').limit(1);
      if (error) throw error;
      return this.getStatus('resume_service_db', true, { message: 'Resume Service DB is healthy' });
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      throw new HealthCheckError('Resume Service DB check failed', error);
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

  async createResume(resumeData: any): Promise<any> {
    return this.retryOperation(async () => {
      try {
        const { data, error } = await this.supabase.from('resumes').insert(resumeData).single();
        if (error) throw new Error(`Failed to create resume: ${error.message}`);
        return data;
      } catch (error) {
        this.logger.error(`Error creating resume: ${error.message}`);
        throw new InternalServerErrorException('Failed to create resume');
      }
    });
  }

  async getResume(resumeId: string): Promise<any> {
    return this.retryOperation(async () => {
      try {
        const { data, error } = await this.supabase.from('resumes').select('*').eq('id', resumeId).single();
        if (error) throw new Error(`Failed to get resume: ${error.message}`);
        return data;
      } catch (error) {
        this.logger.error(`Error getting resume: ${error.message}`);
        throw new InternalServerErrorException('Failed to get resume');
      }
    });
  }

  async updateResume(resumeId: string, resumeData: any): Promise<any> {
    return this.retryOperation(async () => {
      try {
        const { data, error } = await this.supabase.from('resumes').update(resumeData).eq('id', resumeId).single();
        if (error) throw new Error(`Failed to update resume: ${error.message}`);
        return data;
      } catch (error) {
        this.logger.error(`Error updating resume: ${error.message}`);
        throw new InternalServerErrorException('Failed to update resume');
      }
    });
  }

  async deleteResume(resumeId: string): Promise<void> {
    return this.retryOperation(async () => {
      try {
        const { error } = await this.supabase.from('resumes').delete().eq('id', resumeId);
        if (error) throw new Error(`Failed to delete resume: ${error.message}`);
      } catch (error) {
        this.logger.error(`Error deleting resume: ${error.message}`);
        throw new InternalServerErrorException('Failed to delete resume');
      }
    });
  }

  async listResumes(page: number = 1, limit: number = 10): Promise<{ resumes: any[], total: number }> {
    return this.retryOperation(async () => {
      try {
        const { data, error, count } = await this.supabase
          .from('resumes')
          .select('*', { count: 'exact' })
          .range((page - 1) * limit, page * limit - 1);

        if (error) throw new Error(`Failed to list resumes: ${error.message}`);
        return { resumes: data, total: count };
      } catch (error) {
        this.logger.error(`Error listing resumes: ${error.message}`);
        throw new InternalServerErrorException('Failed to list resumes');
      }
    });
  }
}
