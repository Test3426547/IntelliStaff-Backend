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
    try {
      const jobs = await scrapeLinkedInJobs(searchUrl, limit);
      const insertedJobs: JobData[] = [];

      for (const job of jobs) {
        try {
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
            this.logger.error(`Failed to insert job: ${error.message}`);
            continue;
          }

          const insertedJob = data as JobData;
          insertedJobs.push(insertedJob);
          await this.jobProcessingService.processJob(insertedJob.id);
        } catch (error) {
          this.logger.error(`Error processing job: ${error.message}`);
        }
      }

      return insertedJobs;
    } catch (error) {
      this.logger.error(`Error scraping and ingesting LinkedIn jobs: ${error.message}`);
      throw error;
    }
  }

  // ... (keep other existing methods)
}
