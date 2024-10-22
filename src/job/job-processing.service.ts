import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';

@Injectable()
export class JobProcessingService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(JobProcessingService.name);
  private huggingfaceApiKey: string;
  private huggingfaceInferenceEndpoint: string;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.huggingfaceApiKey = this.configService.get<string>('HUGGINGFACE_API_KEY');
    this.huggingfaceInferenceEndpoint = this.configService.get<string>('HUGGINGFACE_INFERENCE_ENDPOINT');
  }

  async processJob(jobId: string): Promise<void> {
    try {
      const job = await this.getJob(jobId);
      if (!job) {
        throw new Error(`Job with ID ${jobId} not found`);
      }

      const enhancedDescription = await this.enhanceJobDescription(job.description);
      const keywords = await this.extractKeywords(enhancedDescription);
      const optimizedTitle = await this.optimizeJobTitle(job.title);

      await this.updateJob(jobId, {
        enhanced_description: enhancedDescription,
        keywords: keywords,
        optimized_title: optimizedTitle,
      });

      this.logger.log(`Job ${jobId} processed successfully`);
    } catch (error) {
      this.logger.error(`Error processing job ${jobId}: ${error.message}`);
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

  private async updateJob(jobId: string, updateData: any): Promise<void> {
    const { error } = await this.supabase
      .from('jobs')
      .update(updateData)
      .eq('id', jobId);

    if (error) {
      throw new Error(`Failed to update job: ${error.message}`);
    }
  }

  private async enhanceJobDescription(description: string): Promise<string> {
    const prompt = `Enhance the following job description to make it more engaging and informative:

${description}

Enhanced description:`;

    try {
      const response = await axios.post(
        this.huggingfaceInferenceEndpoint,
        { inputs: prompt },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingfaceApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data[0].generated_text.trim();
    } catch (error) {
      this.logger.error(`Error enhancing job description: ${error.message}`);
      return description;
    }
  }

  private async extractKeywords(text: string): Promise<string[]> {
    const prompt = `Extract the top 10 most relevant keywords from the following text:

${text}

Keywords:`;

    try {
      const response = await axios.post(
        this.huggingfaceInferenceEndpoint,
        { inputs: prompt },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingfaceApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const keywordsText = response.data[0].generated_text.trim();
      return keywordsText.split(',').map(keyword => keyword.trim());
    } catch (error) {
      this.logger.error(`Error extracting keywords: ${error.message}`);
      return [];
    }
  }

  private async optimizeJobTitle(title: string): Promise<string> {
    const prompt = `Optimize the following job title to make it more attractive and SEO-friendly:

${title}

Optimized title:`;

    try {
      const response = await axios.post(
        this.huggingfaceInferenceEndpoint,
        { inputs: prompt },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingfaceApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data[0].generated_text.trim();
    } catch (error) {
      this.logger.error(`Error optimizing job title: ${error.message}`);
      return title;
    }
  }

  async analyzeJobMarketTrends(): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('jobs')
        .select('title, description, keywords')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw new Error(`Failed to fetch recent jobs: ${error.message}`);
      }

      const allKeywords = data.flatMap(job => job.keywords || []);
      const keywordFrequency = allKeywords.reduce((acc, keyword) => {
        acc[keyword] = (acc[keyword] || 0) + 1;
        return acc;
      }, {});

      const sortedTrends = Object.entries(keywordFrequency)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 10)
        .map(([keyword, count]) => ({ keyword, count: count as number }));

      return {
        topTrends: sortedTrends,
        totalJobsAnalyzed: data.length,
      };
    } catch (error) {
      this.logger.error(`Error analyzing job market trends: ${error.message}`);
      throw error;
    }
  }
}
