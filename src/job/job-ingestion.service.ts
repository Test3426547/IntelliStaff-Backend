import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { JobProcessingService } from './job-processing.service';
import axios, { AxiosError } from 'axios';
import { retry, catchError } from 'rxjs/operators';
import { from, throwError } from 'rxjs';

export interface JobData {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  posted_date: string;
  job_type: string;
  applicants: string;
  skills: string[];
  source_url: string;
}

@Injectable()
export class JobIngestionService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(JobIngestionService.name);
  private lastScrapeTime: number = 0;
  private readonly RATE_LIMIT_DELAY: number;
  private readonly MAX_RETRIES: number;
  private readonly SCRAPINGDOG_API_KEY: string;
  private readonly SCRAPINGDOG_API_URL: string = 'https://api.scrapingdog.com/linkedinjobs';
  private jobCache: Map<string, { data: JobData; timestamp: number }> = new Map();
  private readonly CACHE_EXPIRY: number = 3600000; // 1 hour in milliseconds

  constructor(
    private configService: ConfigService,
    private jobProcessingService: JobProcessingService
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.RATE_LIMIT_DELAY = this.configService.get<number>('RATE_LIMIT_DELAY') || 60000;
    this.MAX_RETRIES = this.configService.get<number>('MAX_RETRIES') || 3;
    this.SCRAPINGDOG_API_KEY = this.configService.get<string>('SCRAPINGDOG_API_KEY');
    if (!this.SCRAPINGDOG_API_KEY) {
      throw new Error('SCRAPINGDOG_API_KEY is not set in the environment');
    }
    this.logger.log('JobIngestionService initialized');
  }

  private async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastScrape = now - this.lastScrapeTime;
    if (timeSinceLastScrape < this.RATE_LIMIT_DELAY) {
      const waitTime = this.RATE_LIMIT_DELAY - timeSinceLastScrape;
      this.logger.log(`Rate limiting: Waiting for ${waitTime}ms before next scrape`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastScrapeTime = Date.now();
  }

  async scrapeAndIngestLinkedInJobs(jobId: string): Promise<JobData> {
    this.logger.log(`Starting to scrape and ingest LinkedIn job with ID: ${jobId}`);
    try {
      await this.enforceRateLimit();
      
      const cachedJob = this.getCachedJob(jobId);
      if (cachedJob) {
        this.logger.log(`Retrieved job ${jobId} from cache`);
        return cachedJob;
      }

      const startTime = Date.now();
      const job = await this.scrapeLinkedInJob(jobId);
      const endTime = Date.now();
      this.logger.log(`Successfully scraped job from LinkedIn in ${endTime - startTime}ms`);

      const insertedJob = await this.insertJob(job);
      this.cacheJob(jobId, insertedJob);

      this.logScrapingStats(startTime, Date.now(), 1, insertedJob ? 1 : 0);
      return insertedJob;
    } catch (error) {
      this.logger.error(`Error scraping and ingesting LinkedIn job: ${error.message}`);
      throw new HttpException('Failed to scrape and ingest LinkedIn job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private scrapeLinkedInJob(jobId: string) {
    return from(axios.get(this.SCRAPINGDOG_API_URL, {
      params: {
        api_key: this.SCRAPINGDOG_API_KEY,
        job_id: jobId,
      },
    })).pipe(
      retry(this.MAX_RETRIES),
      catchError((error: AxiosError) => {
        if (error.response) {
          this.logger.error(`ScrapingDog API error: ${error.response.status} - ${error.response.statusText}`);
          return throwError(() => new HttpException(`ScrapingDog API error: ${error.response.status} - ${error.response.statusText}`, HttpStatus.BAD_GATEWAY));
        } else if (error.request) {
          this.logger.error('No response received from ScrapingDog API');
          return throwError(() => new HttpException('No response received from ScrapingDog API', HttpStatus.GATEWAY_TIMEOUT));
        }
        this.logger.error(`Error scraping LinkedIn job: ${error.message}`);
        return throwError(() => new HttpException('Error scraping LinkedIn job', HttpStatus.INTERNAL_SERVER_ERROR));
      })
    ).toPromise().then(response => {
      if (response.status !== 200) {
        throw new HttpException(`ScrapingDog API returned status code ${response.status}`, HttpStatus.BAD_GATEWAY);
      }
      if (!response.data || response.data.length === 0) {
        throw new HttpException('No job data returned from ScrapingDog API', HttpStatus.NOT_FOUND);
      }
      this.logger.log(`Successfully scraped job data for job ID: ${jobId}`);
      return this.mapScrapedDataToJobData(response.data[0]);
    });
  }

  private mapScrapedDataToJobData(scrapedData: any): JobData {
    return {
      id: scrapedData.job_id || '',
      title: scrapedData.job_position || '',
      company: scrapedData.company_name || '',
      location: scrapedData.job_location || '',
      description: scrapedData.job_description || '',
      posted_date: scrapedData.job_posting_time || '',
      job_type: scrapedData.Employment_type || '',
      applicants: scrapedData.applicants || '',
      skills: scrapedData.Industries ? scrapedData.Industries.split(',').map(s => s.trim()) : [],
      source_url: scrapedData.job_apply_link || '',
    };
  }

  private async insertJob(job: JobData): Promise<JobData | null> {
    try {
      const { data, error } = await this.supabase
        .from('jobs')
        .insert(job)
        .single();

      if (error) {
        this.logger.error(`Failed to insert job: ${error.message}`);
        return null;
      }

      const insertedJob = data as JobData;
      this.logger.debug(`Job inserted successfully. ID: ${insertedJob.id}`);
      await this.jobProcessingService.processJob(insertedJob.id);
      return insertedJob;
    } catch (error) {
      this.logger.error(`Error inserting job: ${error.message}`);
      throw error;
    }
  }

  async getJobById(jobId: string): Promise<JobData | null> {
    this.logger.debug(`Fetching job with ID: ${jobId}`);
    try {
      const cachedJob = this.getCachedJob(jobId);
      if (cachedJob) {
        this.logger.log(`Retrieved job ${jobId} from cache`);
        return cachedJob;
      }

      const { data, error } = await this.supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) {
        this.logger.error(`Failed to fetch job: ${error.message}`);
        return null;
      }

      this.logger.debug(`Successfully fetched job with ID: ${jobId}`);
      const job = data as JobData;
      this.cacheJob(jobId, job);
      return job;
    } catch (error) {
      this.logger.error(`Error fetching job: ${error.message}`);
      return null;
    }
  }

  async listJobs(page: number = 1, limit: number = 10): Promise<{ jobs: JobData[], total: number }> {
    this.logger.debug(`Listing jobs: page ${page}, limit ${limit}`);
    try {
      const startTime = Date.now();
      const { data, error, count } = await this.supabase
        .from('jobs')
        .select('*', { count: 'exact' })
        .range((page - 1) * limit, page * limit - 1)
        .order('posted_date', { ascending: false });

      const endTime = Date.now();

      if (error) {
        this.logger.error(`Failed to list jobs: ${error.message}`);
        return { jobs: [], total: 0 };
      }

      this.logger.debug(`Successfully listed ${data.length} jobs. Total count: ${count}. Query time: ${endTime - startTime}ms`);
      return { jobs: data as JobData[], total: count || 0 };
    } catch (error) {
      this.logger.error(`Error listing jobs: ${error.message}`);
      return { jobs: [], total: 0 };
    }
  }

  private logScrapingStats(startTime: number, endTime: number, totalJobs: number, successfulJobs: number): void {
    const duration = endTime - startTime;
    const successRate = (successfulJobs / totalJobs) * 100;
    this.logger.log(`Scraping Statistics:
      Total Duration: ${duration}ms
      Total Jobs Scraped: ${totalJobs}
      Successfully Inserted Jobs: ${successfulJobs}
      Success Rate: ${successRate.toFixed(2)}%
    `);
  }

  private getCachedJob(jobId: string): JobData | null {
    const cachedJob = this.jobCache.get(jobId);
    if (cachedJob && Date.now() - cachedJob.timestamp < this.CACHE_EXPIRY) {
      return cachedJob.data;
    }
    return null;
  }

  private cacheJob(jobId: string, job: JobData): void {
    this.jobCache.set(jobId, { data: job, timestamp: Date.now() });
  }

  async batchScrapeAndIngestJobs(jobIds: string[]): Promise<JobData[]> {
    const results: JobData[] = [];
    for (const jobId of jobIds) {
      try {
        const job = await this.scrapeAndIngestLinkedInJobs(jobId);
        results.push(job);
      } catch (error) {
        this.logger.error(`Failed to scrape and ingest job ${jobId}: ${error.message}`);
      }
    }
    return results;
  }
}
