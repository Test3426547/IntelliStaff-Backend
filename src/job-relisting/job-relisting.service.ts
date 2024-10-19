import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { PlatformIntegrationService } from './platform-integration.service';
import { Job } from '../common/interfaces/job.interface';

@Injectable()
export class JobRelistingService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(JobRelistingService.name);
  private relistingQueue: string[] = [];
  private isProcessing: boolean = false;

  constructor(
    private configService: ConfigService,
    private platformIntegrationService: PlatformIntegrationService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
  }

  async relistJob(jobId: string): Promise<Job> {
    const { data: job, error } = await this.supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) throw new Error(`Failed to fetch job: ${error.message}`);

    if (await this.isDuplicate(job)) {
      throw new Error('This job is already listed on external platforms');
    }

    this.relistingQueue.push(jobId);
    this.processQueue();

    return job;
  }

  private async processQueue() {
    if (this.isProcessing || this.relistingQueue.length === 0) return;

    this.isProcessing = true;
    const jobId = this.relistingQueue.shift();

    try {
      const { data: job, error } = await this.supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw new Error(`Failed to fetch job: ${error.message}`);

      const relistedJob = await this.platformIntegrationService.relistJob(job);

      const { data: updatedJob, error: updateError } = await this.supabase
        .from('jobs')
        .update({ ...relistedJob, lastRelistedDate: new Date() })
        .eq('id', jobId)
        .single();

      if (updateError) throw new Error(`Failed to update job: ${updateError.message}`);

      this.logger.log(`Job ${jobId} relisted successfully`);
    } catch (error) {
      this.logger.error(`Failed to relist job ${jobId}: ${error.message}`);
    } finally {
      this.isProcessing = false;
      this.processQueue();
    }
  }

  async getRelistedJobs(page: number = 1, pageSize: number = 10): Promise<{ jobs: Job[], totalCount: number }> {
    const startIndex = (page - 1) * pageSize;
    const { data, error, count } = await this.supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .not('lastRelistedDate', 'is', null)
      .range(startIndex, startIndex + pageSize - 1)
      .order('lastRelistedDate', { ascending: false });

    if (error) throw new Error(`Failed to fetch relisted jobs: ${error.message}`);
    return { jobs: data, totalCount: count };
  }

  private async isDuplicate(job: Job): Promise<boolean> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await this.supabase
      .from('jobs')
      .select('id')
      .eq('title', job.title)
      .eq('company', job.company)
      .gte('lastRelistedDate', thirtyDaysAgo.toISOString())
      .not('id', 'eq', job.id)
      .limit(1);

    if (error) throw new Error(`Failed to check for duplicates: ${error.message}`);
    return data.length > 0;
  }
}
