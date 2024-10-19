import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { JobProcessingService } from './job-processing.service';
const { scrapeLinkedInJob, scrapeLinkedInJobs, scrapeLinkedInCompany } = require('./linkedin-scraper');

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

  async ingestJob(url: string): Promise<any> {
    try {
      const jobData = await scrapeLinkedInJob(url);
      
      const { data, error } = await this.supabase
        .from('jobs')
        .insert({
          title: jobData.title,
          company: jobData.company,
          location: jobData.location,
          description: jobData.description,
          posted_date: jobData.postedDate,
          job_type: jobData.jobType,
          applicants: jobData.applicants,
          salary: jobData.salary,
          skills: jobData.skills,
          source_url: url,
        })
        .single();

      if (error) throw new Error(`Failed to insert job: ${error.message}`);

      // Trigger job processing
      await this.jobProcessingService.processJob(data.id);

      return data;
    } catch (error) {
      this.logger.error(`Error ingesting job: ${error.message}`);
      throw error;
    }
  }

  async ingestMultipleJobs(searchUrl: string, limit: number = 10): Promise<any[]> {
    try {
      const jobs = await scrapeLinkedInJobs(searchUrl, limit);
      const insertedJobs = [];

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

          insertedJobs.push(data);
          await this.jobProcessingService.processJob(data.id);
        } catch (error) {
          this.logger.error(`Error processing job: ${error.message}`);
        }
      }

      return insertedJobs;
    } catch (error) {
      this.logger.error(`Error ingesting multiple jobs: ${error.message}`);
      throw error;
    }
  }

  async ingestCompany(url: string): Promise<any> {
    try {
      const companyData = await scrapeLinkedInCompany(url);
      
      const { data, error } = await this.supabase
        .from('companies')
        .insert({
          name: companyData.name,
          industry: companyData.industry,
          employee_count: companyData.employeeCount,
          description: companyData.description,
          source_url: companyData.url,
        })
        .single();

      if (error) throw new Error(`Failed to insert company: ${error.message}`);

      return data;
    } catch (error) {
      this.logger.error(`Error ingesting company: ${error.message}`);
      throw error;
    }
  }

  async getJobs(page: number = 1, limit: number = 10): Promise<{ jobs: any[], total: number }> {
    try {
      const { data, error, count } = await this.supabase
        .from('jobs')
        .select('*', { count: 'exact' })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw new Error(`Failed to fetch jobs: ${error.message}`);

      return { jobs: data, total: count };
    } catch (error) {
      this.logger.error(`Error fetching jobs: ${error.message}`);
      throw error;
    }
  }

  async getCompanies(page: number = 1, limit: number = 10): Promise<{ companies: any[], total: number }> {
    try {
      const { data, error, count } = await this.supabase
        .from('companies')
        .select('*', { count: 'exact' })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw new Error(`Failed to fetch companies: ${error.message}`);

      return { companies: data, total: count };
    } catch (error) {
      this.logger.error(`Error fetching companies: ${error.message}`);
      throw error;
    }
  }
}
