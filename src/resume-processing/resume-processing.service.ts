import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import * as tf from '@tensorflow/tfjs-node';
import * as natural from 'natural';
import axios from 'axios';

@Injectable()
export class ResumeProcessingService extends HealthIndicator {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(ResumeProcessingService.name);
  private huggingfaceApiKey: string;
  private huggingfaceInferenceEndpoint: string;

  constructor(private configService: ConfigService) {
    super();
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.huggingfaceApiKey = this.configService.get<string>('HUGGINGFACE_API_KEY');
    this.huggingfaceInferenceEndpoint = this.configService.get<string>('HUGGINGFACE_INFERENCE_ENDPOINT');
  }

  async checkHealth(): Promise<HealthIndicatorResult> {
    try {
      const { data, error } = await this.supabase.from('resumes').select('id').limit(1);
      if (error) throw error;
      return this.getStatus('resume_processing_db', true, { message: 'Resume Processing DB is healthy' });
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      throw new HealthCheckError('Resume Processing DB check failed', error);
    }
  }

  async processResume(resumeId: string): Promise<any> {
    try {
      const resume = await this.getResume(resumeId);
      if (!resume) {
        throw new Error(`Resume with ID ${resumeId} not found`);
      }

      const extractedInfo = await this.extractInformation(resume.content);
      const enhancedInfo = await this.enhanceInformation(extractedInfo);
      const keywordScore = await this.calculateKeywordScore(enhancedInfo);
      const mlScore = await this.calculateMLScore(enhancedInfo);
      const nlpScore = await this.calculateNLPScore(enhancedInfo);

      const processedResume = {
        ...enhancedInfo,
        keyword_score: keywordScore,
        ml_score: mlScore,
        nlp_score: nlpScore,
      };

      await this.updateResume(resumeId, processedResume);

      return processedResume;
    } catch (error) {
      this.logger.error(`Error processing resume ${resumeId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to process resume');
    }
  }

  private async getResume(resumeId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch resume: ${error.message}`);
    }

    return data;
  }

  private async updateResume(resumeId: string, processedData: any): Promise<void> {
    const { error } = await this.supabase
      .from('resumes')
      .update(processedData)
      .eq('id', resumeId);

    if (error) {
      throw new Error(`Failed to update resume: ${error.message}`);
    }
  }

  private async extractInformation(content: string): Promise<any> {
    try {
      const response = await axios.post(
        this.huggingfaceInferenceEndpoint,
        { inputs: content },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingfaceApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data[0];
    } catch (error) {
      this.logger.error(`Error extracting information: ${error.message}`);
      throw new Error('Failed to extract information from resume');
    }
  }

  private async enhanceInformation(extractedInfo: any): Promise<any> {
    // Implement logic to enhance extracted information
    // This could include entity recognition, sentiment analysis, etc.
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(JSON.stringify(extractedInfo));

    const enhancedInfo = {
      ...extractedInfo,
      token_count: tokens.length,
      // Add more enhanced features here
    };

    return enhancedInfo;
  }

  private async calculateKeywordScore(info: any): Promise<number> {
    // Implement keyword matching logic
    const keywords = ['typescript', 'javascript', 'nodejs', 'nestjs', 'ai', 'ml'];
    const content = JSON.stringify(info).toLowerCase();
    const matchCount = keywords.filter(keyword => content.includes(keyword)).length;
    return (matchCount / keywords.length) * 100;
  }

  private async calculateMLScore(info: any): Promise<number> {
    // Implement ML-based scoring using TensorFlow.js
    const model = await this.getOrCreateMLModel();
    const input = tf.tensor2d([this.featurizeInfo(info)]);
    const prediction = model.predict(input) as tf.Tensor;
    const score = prediction.dataSync()[0] * 100;
    return Math.round(score * 100) / 100;
  }

  private async getOrCreateMLModel(): Promise<tf.LayersModel> {
    try {
      return await tf.loadLayersModel('localstorage://resume-scoring-model');
    } catch (error) {
      // If model doesn't exist, create a new one
      const model = tf.sequential();
      model.add(tf.layers.dense({ units: 10, inputShape: [5], activation: 'relu' }));
      model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
      model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy' });
      await model.save('localstorage://resume-scoring-model');
      return model;
    }
  }

  private featurizeInfo(info: any): number[] {
    // Convert info object to feature vector
    // This is a simplified example and should be expanded based on actual data
    return [
      info.token_count || 0,
      (info.education && info.education.length) || 0,
      (info.work_experience && info.work_experience.length) || 0,
      (info.skills && info.skills.length) || 0,
      (info.projects && info.projects.length) || 0,
    ];
  }

  private async calculateNLPScore(info: any): Promise<number> {
    // Implement NLP-based scoring
    const content = JSON.stringify(info);
    const sentiment = natural.SentimentAnalyzer.analyze(content);
    return (sentiment.score + 1) * 50; // Normalize to 0-100 scale
  }

  async generatePersonalizedFeedback(resumeId: string): Promise<string> {
    try {
      const resume = await this.getResume(resumeId);
      if (!resume) {
        throw new Error(`Resume with ID ${resumeId} not found`);
      }

      const prompt = `Based on the following resume information, provide personalized feedback for improvement:
      ${JSON.stringify(resume)}
      
      Feedback:`;

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
      this.logger.error(`Error generating personalized feedback: ${error.message}`);
      throw new InternalServerErrorException('Failed to generate personalized feedback');
    }
  }
}
