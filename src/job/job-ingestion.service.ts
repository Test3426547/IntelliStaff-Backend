import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { JobProcessingService } from './job-processing.service';
const { scrapeLinkedInJob, scrapeLinkedInJobs, scrapeLinkedInCompany } = require('./linkedin-scraper');

interface JobData {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  posted_date: string;
  job_type: string;
  applicants: string;
  salary: string;
  skills: string[];
  source_url: string;
}

@Injectable()
export class JobIngestionService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(JobIngestionService.name);

  constructor(
    private configService: ConfigService,
    private jobProcessingService: JobProcessingService
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.logger.log('JobIngestionService initialized');
  }

  async scrapeAndIngestLinkedInJobs(searchUrl: string, limit: number = 10): Promise<JobData[]> {
    this.logger.log(`Starting to scrape and ingest LinkedIn jobs from: ${searchUrl}`);
    this.logger.debug(`Scraping limit set to: ${limit} jobs`);
    try {
      this.logger.debug(`Attempting to scrape ${limit} jobs from LinkedIn`);
      const startTime = Date.now();
      const jobs = await scrapeLinkedInJobs(searchUrl, limit);
      const endTime = Date.now();
      this.logger.log(`Successfully scraped ${jobs.length} jobs from LinkedIn in ${endTime - startTime}ms`);

      const insertedJobs: JobData[] = [];

      for (const job of jobs) {
        try {
          this.logger.debug(`Processing job: ${job.title} at ${job.company}`);
          this.logger.verbose(`Job details: ${JSON.stringify(job)}`);

          const { data, error } = await this.supabase
            .from('jobs')
            .insert({
              title: job.title,
              company: job.company,
              location: job.location,
              description: job.description,
              posted_date: job.postedDate,
              job_type: job.jobType,
              applicants: job.applicants,
              salary: job.salary,
              skills: job.skills,
              source_url: job.url,
            })
            .single();

          if (error) {
            this.logger.error(`Failed to insert job: ${error.message}`, error.stack);
            this.logger.verbose(`Failed job data: ${JSON.stringify(job)}`);
            continue;
          }

          const insertedJob = data as JobData;
          insertedJobs.push(insertedJob);
          this.logger.debug(`Job inserted successfully. ID: ${insertedJob.id}`);

          this.logger.debug(`Triggering job processing for job ID: ${insertedJob.id}`);
          await this.jobProcessingService.processJob(insertedJob.id);
          this.logger.debug(`Job processing completed for job ID: ${insertedJob.id}`);
        } catch (error) {
          this.logger.error(`Error processing job: ${error.message}`, error.stack);
          this.logger.verbose(`Error occurred while processing job: ${JSON.stringify(job)}`);
        }
      }

      this.logger.log(`Successfully inserted ${insertedJobs.length} out of ${jobs.length} scraped jobs into the database`);
      return insertedJobs;
    } catch (error) {
      this.logger.error(`Error scraping and ingesting LinkedIn jobs: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getJobById(jobId: string): Promise<JobData | null> {
    this.logger.debug(`Fetching job with ID: ${jobId}`);
    try {
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
      this.logger.verbose(`Job data: ${JSON.stringify(data)}`);
      return data as JobData;
    } catch (error) {
      this.logger.error(`Error fetching job: ${error.message}`, error.stack);
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
      this.logger.verbose(`Job list data: ${JSON.stringify(data)}`);
      return { jobs: data as JobData[], total: count || 0 };
    } catch (error) {
      this.logger.error(`Error listing jobs: ${error.message}`, error.stack);
      return { jobs: [], total: 0 };
    }
  }

  // New method to log scraping statistics
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
}
