import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as tf from '@tensorflow/tfjs-node';
import axios from 'axios';

@Injectable()
export class ApplicantMatchingService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(ApplicantMatchingService.name);
  private model: tf.Sequential;
  private huggingfaceApiKey: string;
  private huggingfaceInferenceEndpoint: string;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.huggingfaceApiKey = this.configService.get<string>('HUGGINGFACE_API_KEY');
    this.huggingfaceInferenceEndpoint = this.configService.get<string>('HUGGINGFACE_INFERENCE_ENDPOINT');
    this.initializeModel();
  }

  private async initializeModel() {
    this.model = tf.sequential();
    this.model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [20] }));
    this.model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    this.model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
    this.model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });
  }

  async matchApplicant(applicantId: string, jobId: string): Promise<number> {
    try {
      const applicant = await this.getApplicant(applicantId);
      const job = await this.getJob(jobId);

      const applicantFeatures = this.extractApplicantFeatures(applicant);
      const jobFeatures = this.extractJobFeatures(job);

      const combinedFeatures = tf.tensor2d([...applicantFeatures, ...jobFeatures], [1, 20]);
      const prediction = this.model.predict(combinedFeatures) as tf.Tensor;
      const matchScore = prediction.dataSync()[0];

      await this.saveMatchResult(applicantId, jobId, matchScore);

      return matchScore;
    } catch (error) {
      this.logger.error(`Error matching applicant: ${error.message}`);
      throw new Error('Failed to match applicant');
    }
  }

  private async getApplicant(applicantId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('processed_resumes')
      .select('*')
      .eq('id', applicantId)
      .single();

    if (error) throw new Error(`Failed to fetch applicant: ${error.message}`);
    return data;
  }

  private async getJob(jobId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) throw new Error(`Failed to fetch job: ${error.message}`);
    return data;
  }

  private extractApplicantFeatures(applicant: any): number[] {
    return [
      applicant.skills.length,
      applicant.experience.length,
      applicant.education.length,
      applicant.keyword_score || 0,
      applicant.ml_score || 0,
      applicant.nlp_score || 0,
      applicant.sentiment_score || 0,
      // Add more relevant features here
    ];
  }

  private extractJobFeatures(job: any): number[] {
    return [
      job.requirements.length,
      job.description.length,
      job.title.length,
      job.company.length,
      job.location.length,
      // Add more relevant features here
    ];
  }

  private async saveMatchResult(applicantId: string, jobId: string, matchScore: number): Promise<void> {
    const { error } = await this.supabase
      .from('applicant_job_matches')
      .upsert({
        applicant_id: applicantId,
        job_id: jobId,
        match_score: matchScore,
        matched_at: new Date().toISOString(),
      });

    if (error) throw new Error(`Failed to save match result: ${error.message}`);
  }

  async getTopMatchesForJob(jobId: string, limit: number = 10): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('applicant_job_matches')
      .select('*, processed_resumes(*)')
      .eq('job_id', jobId)
      .order('match_score', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch top matches: ${error.message}`);
    return data;
  }

  async getTopMatchesForApplicant(applicantId: string, limit: number = 10): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('applicant_job_matches')
      .select('*, jobs(*)')
      .eq('applicant_id', applicantId)
      .order('match_score', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch top matches: ${error.message}`);
    return data;
  }

  async enhanceMatchingWithHuggingFace(applicantId: string, jobId: string): Promise<string> {
    try {
      const applicant = await this.getApplicant(applicantId);
      const job = await this.getJob(jobId);

      const prompt = `
        Given the following applicant and job information, provide an analysis of their compatibility:

        Applicant:
        Skills: ${applicant.skills.join(', ')}
        Experience: ${applicant.experience.join(' ')}
        Education: ${applicant.education.join(' ')}

        Job:
        Title: ${job.title}
        Description: ${job.description}
        Requirements: ${job.requirements.join(', ')}

        Please provide:
        1. A compatibility score (0-100)
        2. Key strengths of the applicant for this job
        3. Areas where the applicant might need improvement
        4. Overall recommendation
      `;

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
      this.logger.error(`Error enhancing matching with HuggingFace: ${error.message}`);
      throw new Error('Failed to enhance matching with HuggingFace');
    }
  }
}
