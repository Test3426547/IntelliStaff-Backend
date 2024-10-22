import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { WebScraperService } from './web-scraper.service';
import { Job } from '../common/interfaces/job.interface';
import { CreateJobDto } from '../common/dto/create-job.dto';
import { JobProcessingService } from '../job-processing/job-processing.service';

@Injectable()
export class JobIngestionService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(JobIngestionService.name);

  constructor(
    private configService: ConfigService,
    private webScraperService: WebScraperService,
    private jobProcessingService: JobProcessingService
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
  }

  async ingestJobs(url: string, batchSize: number = 10, maxJobs: number = 100): Promise<void> {
    try {
      this.logger.log(`Starting job ingestion from ${url}`);
      const scrapedData = await this.webScraperService.scrapeJobs(url, maxJobs);
      this.logger.log(`Scraped ${scrapedData.length} jobs from ${url}`);
      
      const normalizedJobs = this.normalizeJobData(scrapedData);
      this.logger.log(`Normalized ${normalizedJobs.length} jobs`);
      
      const savedJobs = await this.saveJobsInBatches(normalizedJobs, batchSize);
      this.logger.log(`Saved ${savedJobs} unique jobs to the database`);
      
      this.logger.log(`Job ingestion completed successfully`);
    } catch (error) {
      this.logger.error(`Error during job ingestion: ${error.message}`, error.stack);
      throw new Error(`Job ingestion failed: ${error.message}`);
    }
  }

  private normalizeJobData(scrapedData: any[]): CreateJobDto[] {
    return scrapedData.map((job) => ({
      title: job.title?.trim() || 'Unknown Title',
      company: job.company?.trim() || 'Unknown Company',
      description: job.description?.trim() || '',
      requirements: Array.isArray(job.requirements) ? job.requirements.filter(Boolean).map(req => req.trim()) : [],
      location: job.location?.trim() || 'Unknown Location',
      salary: job.salary?.trim() || null,
      postedDate: job.postedDate ? new Date(job.postedDate) : new Date(),
      source: 'web_scraping',
    }));
  }

  private async saveJobsInBatches(jobs: CreateJobDto[], batchSize: number): Promise<number> {
    let savedJobs = 0;
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);
      const savedBatchJobs = await this.saveUniqueJobsToDatabase(batch);
      savedJobs += savedBatchJobs;
      await this.delay(1000); // Add a 1-second delay between batches
    }
    return savedJobs;
  }

  private async saveUniqueJobsToDatabase(jobs: CreateJobDto[]): Promise<number> {
    let savedJobs = 0;
    const savedJobIds: string[] = [];
    for (const job of jobs) {
      try {
        if (await this.isJobUnique(job)) {
          const { data, error } = await this.supabase.from('jobs').insert(job).select();
          if (error) {
            this.logger.error(`Failed to save job: ${error.message}`);
          } else if (data && data.length > 0) {
            this.logger.log(`Job saved successfully: ${job.title} at ${job.company}`);
            savedJobs++;
            savedJobIds.push(data[0].id);
          }
        } else {
          this.logger.log(`Duplicate job found, skipping: ${job.title} at ${job.company}`);
        }
      } catch (error) {
        this.logger.error(`Error while saving job: ${error.message}`, error.stack);
      }
    }

    if (savedJobIds.length > 0) {
      await this.triggerJobProcessing(savedJobIds);
    }

    return savedJobs;
  }

  private async isJobUnique(job: CreateJobDto): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('jobs')
        .select('id')
        .eq('title', job.title)
        .eq('company', job.company)
        .eq('location', job.location)
        .single();

      if (error && error.code !== 'PGRST116') {
        this.logger.error(`Error checking for unique job: ${error.message}`);
        return false;
      }

      return !data;
    } catch (error) {
      this.logger.error(`Error checking job uniqueness: ${error.message}`, error.stack);
      return false;
    }
  }

  private async triggerJobProcessing(jobIds: string[]): Promise<void> {
    try {
      await this.jobProcessingService.processJobs(jobIds);
      this.logger.log(`Triggered processing for ${jobIds.length} jobs`);
    } catch (error) {
      this.logger.error(`Failed to trigger job processing: ${error.message}`, error.stack);
    }
  }

  async getJobs(): Promise<Job[]> {
    try {
      const { data, error } = await this.supabase.from('jobs').select('*');
      if (error) throw new Error(`Failed to fetch jobs: ${error.message}`);
      return data;
    } catch (error) {
      this.logger.error(`Error fetching jobs: ${error.message}`, error.stack);
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
