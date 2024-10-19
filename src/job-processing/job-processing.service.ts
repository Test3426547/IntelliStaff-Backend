import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { KeywordOptimizerService } from './keyword-optimizer.service';
import { Job } from '../common/interfaces/job.interface';
import * as tf from '@tensorflow/tfjs-node';
import { NlpManager } from 'node-nlp';
import * as synaptic from 'synaptic';
import axios from 'axios';

@Injectable()
export class JobProcessingService {
  private supabase: SupabaseClient;
  private model: tf.Sequential;
  private nlpManager: NlpManager;
  private synapticNetwork: synaptic.Architect.Perceptron;
  private huggingfaceApiKey: string;
  private huggingfaceInferenceEndpoint: string;

  constructor(
    private configService: ConfigService,
    private keywordOptimizerService: KeywordOptimizerService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.huggingfaceApiKey = this.configService.get<string>('HUGGINGFACE_API_KEY');
    this.huggingfaceInferenceEndpoint = this.configService.get<string>('HUGGINGFACE_INFERENCE_ENDPOINT');
    this.initializeModel();
    this.initializeNlpManager();
    this.initializeSynapticNetwork();
  }

  private initializeModel() {
    this.model = tf.sequential();
    this.model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [10] }));
    this.model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    this.model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
    this.model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });
  }

  private initializeNlpManager() {
    this.nlpManager = new NlpManager({ languages: ['en'] });
    this.nlpManager.addDocument('en', 'We are looking for a software engineer', 'job.tech');
    this.nlpManager.addDocument('en', 'Seeking a marketing specialist', 'job.marketing');
    this.nlpManager.addDocument('en', 'Financial analyst position open', 'job.finance');
    this.nlpManager.train();
  }

  private initializeSynapticNetwork() {
    this.synapticNetwork = new synaptic.Architect.Perceptron(10, 15, 1);
  }

  async optimizeJob(jobId: string): Promise<Job> {
    const { data: job, error } = await this.supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) throw new Error(`Failed to fetch job: ${error.message}`);

    const optimizedDescription = await this.enhanceJobDescription(job.description);
    const optimizedRequirements = await Promise.all(
      job.requirements.map(req => this.keywordOptimizerService.optimizeKeywords(req))
    );

    const jobFeatures = this.extractJobFeatures(job);
    const tfMatchScore = await this.predictMatchScoreTensorflow(jobFeatures);
    const synapticMatchScore = this.predictMatchScoreSynaptic(jobFeatures);
    const matchScore = (tfMatchScore + synapticMatchScore) / 2;

    const optimizedJob = {
      ...job,
      description: optimizedDescription,
      requirements: optimizedRequirements,
      matchScore,
    };

    const { data: updatedJob, error: updateError } = await this.supabase
      .from('jobs')
      .update(optimizedJob)
      .eq('id', jobId)
      .single();

    if (updateError) throw new Error(`Failed to update job: ${updateError.message}`);

    return updatedJob;
  }

  private extractJobFeatures(job: Job): number[] {
    return [
      job.title.length,
      job.description.length,
      job.requirements.length,
      job.location.length,
      job.salary ? parseFloat(job.salary.replace(/[^0-9.]/g, '')) : 0,
      // Add more relevant features here
    ];
  }

  private async predictMatchScoreTensorflow(features: number[]): Promise<number> {
    const tensorFeatures = tf.tensor2d([features]);
    const prediction = this.model.predict(tensorFeatures) as tf.Tensor;
    const score = prediction.dataSync()[0];
    return score;
  }

  private predictMatchScoreSynaptic(features: number[]): number {
    return this.synapticNetwork.activate(features)[0];
  }

  async getOptimizedJobs(): Promise<Job[]> {
    const { data, error } = await this.supabase
      .from('jobs')
      .select('*')
      .not('description', 'eq', null);

    if (error) throw new Error(`Failed to fetch optimized jobs: ${error.message}`);
    return data;
  }

  async processJobs(jobIds: string[]): Promise<void> {
    for (const jobId of jobIds) {
      await this.optimizeJob(jobId);
    }
  }

  private async enhanceJobDescription(description: string): Promise<string> {
    const result = await this.nlpManager.process('en', description);
    const jobCategory = result.intent;

    const prompt = `Enhance the following ${jobCategory} job description to make it more appealing and informative, while maintaining its core content:

${description}

Please provide an enhanced version that:
1. Improves clarity and readability
2. Highlights key responsibilities and requirements
3. Adds engaging language to attract potential candidates
4. Maintains a professional tone
5. Keeps the enhanced version concise (no more than 20% longer than the original)
6. Incorporates relevant keywords for ${jobCategory} positions`;

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
      console.error('Error calling HuggingFace Inference Endpoint:', error);
      throw new Error('Failed to enhance job description');
    }
  }
}
