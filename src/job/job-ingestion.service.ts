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
  }

  async scrapeAndIngestLinkedInJobs(searchUrl: string, limit: number = 10): Promise<JobData[]> {
    this.logger.log(`Starting to scrape and ingest LinkedIn jobs from: ${searchUrl}`);
    try {
      const jobs = await scrapeLinkedInJobs(searchUrl, limit);
      this.logger.log(`Scraped ${jobs.length} jobs from LinkedIn`);

      const insertedJobs: JobData[] = [];

      for (const job of jobs) {
        try {
          this.logger.debug(`Inserting job: ${job.title} at ${job.company}`);
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
            continue;
          }

          const insertedJob = data as JobData;
          insertedJobs.push(insertedJob);
          this.logger.debug(`Job inserted successfully. ID: ${insertedJob.id}`);

          await this.jobProcessingService.processJob(insertedJob.id);
          this.logger.debug(`Job processing triggered for job ID: ${insertedJob.id}`);
        } catch (error) {
          this.logger.error(`Error processing job: ${error.message}`, error.stack);
        }
      }

      this.logger.log(`Successfully inserted ${insertedJobs.length} jobs into the database`);
      return insertedJobs;
    } catch (error) {
      this.logger.error(`Error scraping and ingesting LinkedIn jobs: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getJobById(jobId: string): Promise<JobData | null> {
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

      return data as JobData;
    } catch (error) {
      this.logger.error(`Error fetching job: ${error.message}`);
      return null;
    }
  }

  async listJobs(page: number = 1, limit: number = 10): Promise<{ jobs: JobData[], total: number }> {
    try {
      const { data, error, count } = await this.supabase
        .from('jobs')
        .select('*', { count: 'exact' })
        .range((page - 1) * limit, page * limit - 1)
        .order('posted_date', { ascending: false });

      if (error) {
        this.logger.error(`Failed to list jobs: ${error.message}`);
        return { jobs: [], total: 0 };
      }

      return { jobs: data as JobData[], total: count || 0 };
    } catch (error) {
      this.logger.error(`Error listing jobs: ${error.message}`);
      return { jobs: [], total: 0 };
    }
  }
}
