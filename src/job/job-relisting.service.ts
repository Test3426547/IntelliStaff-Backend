import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IntegrationService } from '../integration/integration.service';
import * as schedule from 'node-schedule';

@Injectable()
export class JobRelistingService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(JobRelistingService.name);

  constructor(
    private configService: ConfigService,
    private integrationService: IntegrationService
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.initializeScheduler();
  }

  private initializeScheduler() {
    // Schedule job relisting every day at midnight
    schedule.scheduleJob('0 0 * * *', () => {
      this.relistJobsDaily();
    });
  }

  async relistJob(jobId: string): Promise<any> {
    try {
      const job = await this.getJob(jobId);
      if (!job) {
        throw new Error(`Job with ID ${jobId} not found`);
      }

      if (await this.isDuplicate(job)) {
        this.logger.warn(`Job ${jobId} is a duplicate and will not be relisted`);
        return { status: 'skipped', reason: 'duplicate' };
      }

      const relistingResult = await this.integrationService.relistJobOnExternalPlatforms(job);
      await this.updateJobRelistingStatus(jobId, relistingResult);

      return relistingResult;
    } catch (error) {
      this.logger.error(`Error relisting job ${jobId}: ${error.message}`);
      throw error;
    }
  }

  private async getJob(jobId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch job: ${error.message}`);
    }

    return data;
  }

  private async isDuplicate(job: any): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('job_listings')
      .select('id')
      .eq('external_id', job.external_id)
      .eq('platform', job.platform)
      .not('status', 'eq', 'expired')
      .limit(1);

    if (error) {
      throw new Error(`Failed to check for duplicates: ${error.message}`);
    }

    return data.length > 0;
  }

  private async updateJobRelistingStatus(jobId: string, relistingResult: any): Promise<void> {
    const { error } = await this.supabase
      .from('job_listings')
      .insert({
        job_id: jobId,
        platform: relistingResult.platform,
        external_id: relistingResult.externalId,
        status: relistingResult.status,
        relisted_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Failed to update job relisting status: ${error.message}`);
    }
  }

  async getJobRelistingStatus(jobId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('job_listings')
      .select('*')
      .eq('job_id', jobId)
      .order('relisted_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get job relisting status: ${error.message}`);
    }

    return data;
  }

  private async relistJobsDaily() {
    try {
      const { data, error } = await this.supabase
        .from('jobs')
        .select('id')
        .eq('status', 'active')
        .order('last_relisted_at', { ascending: true })
        .limit(100);  // Adjust this limit based on your requirements and rate limits

      if (error) {
        throw new Error(`Failed to fetch jobs for relisting: ${error.message}`);
      }

      for (const job of data) {
        await this.relistJob(job.id);
        await this.updateLastRelistedAt(job.id);
      }

      this.logger.log(`Daily job relisting completed for ${data.length} jobs`);
    } catch (error) {
      this.logger.error(`Error in daily job relisting: ${error.message}`);
    }
  }

  private async updateLastRelistedAt(jobId: string): Promise<void> {
    const { error } = await this.supabase
      .from('jobs')
      .update({ last_relisted_at: new Date().toISOString() })
      .eq('id', jobId);

    if (error) {
      throw new Error(`Failed to update last_relisted_at for job ${jobId}: ${error.message}`);
    }
  }
}
