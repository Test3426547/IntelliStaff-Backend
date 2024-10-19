import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as tf from '@tensorflow/tfjs-node';
import * as natural from 'natural';
import axios from 'axios';

@Injectable()
export class ResumeProcessingService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(ResumeProcessingService.name);
  private model: tf.LayersModel;
  private tokenizer: natural.WordTokenizer;
  private tfidf: natural.TfIdf;
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
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
  }

  private async initializeModel() {
    this.model = tf.sequential();
    this.model.add(tf.layers.embedding({ inputDim: 10000, outputDim: 32, inputLength: 500 }));
    this.model.add(tf.layers.lstm({ units: 64, returnSequences: true }));
    this.model.add(tf.layers.lstm({ units: 64 }));
    this.model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    this.model.add(tf.layers.dropout({ rate: 0.5 }));
    this.model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
    this.model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });
  }

  async processResume(resumeId: string): Promise<any> {
    try {
      const { data: resume, error } = await this.supabase
        .from('processed_resumes')
        .select('*')
        .eq('id', resumeId)
        .single();

      if (error) throw new Error(`Failed to fetch resume: ${error.message}`);

      const extractedInfo = this.extractResumeInfo(resume.extracted_text);
      const enhancedInfo = await this.enhanceResumeInfo(extractedInfo);
      const keywordScore = this.calculateKeywordScore(enhancedInfo);
      const mlScore = await this.calculateMLScore(enhancedInfo);
      const nlpScore = this.calculateNLPScore(enhancedInfo);
      const sentimentScore = this.calculateSentimentScore(enhancedInfo);
      const personalizedFeedback = await this.generatePersonalizedFeedback(enhancedInfo);

      const processedResume = {
        ...resume,
        ...enhancedInfo,
        keyword_score: keywordScore,
        ml_score: mlScore,
        nlp_score: nlpScore,
        sentiment_score: sentimentScore,
        personalized_feedback: personalizedFeedback,
      };

      const { data: updatedResume, error: updateError } = await this.supabase
        .from('processed_resumes')
        .update(processedResume)
        .eq('id', resumeId)
        .single();

      if (updateError) throw new Error(`Failed to update resume: ${updateError.message}`);

      this.logger.log(`Resume ${resumeId} processed successfully`);
      return updatedResume;
    } catch (error) {
      this.logger.error(`Error processing resume: ${error.message}`);
      throw new Error('Failed to process resume');
    }
  }

  private extractResumeInfo(text: string): any {
    const tokens = this.tokenizer.tokenize(text);
    const sentences = new natural.SentenceTokenizer().tokenize(text);

    const name = this.extractName(sentences);
    const email = this.extractEmail(tokens);
    const phone = this.extractPhone(tokens);
    const skills = this.extractSkills(text);
    const education = this.extractEducation(sentences);
    const experience = this.extractExperience(sentences);

    return { name, email, phone, skills, education, experience };
  }

  private extractName(sentences: string[]): string {
    return sentences[0]?.split('\n')[0] || 'Unknown';
  }

  private extractEmail(tokens: string[]): string {
    return tokens.find(token => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(token)) || 'Unknown';
  }

  private extractPhone(tokens: string[]): string {
    return tokens.find(token => /\d{3}[-.]?\d{3}[-.]?\d{4}/.test(token)) || 'Unknown';
  }

  private extractSkills(text: string): string[] {
    const skillKeywords = ['javascript', 'python', 'java', 'c++', 'machine learning', 'data analysis', 'react', 'node.js', 'sql', 'nosql', 'aws', 'azure', 'docker', 'kubernetes', 'agile', 'scrum'];
    return skillKeywords.filter(skill => text.toLowerCase().includes(skill));
  }

  private extractEducation(sentences: string[]): string[] {
    const educationKeywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college'];
    return sentences.filter(sentence => 
      educationKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );
  }

  private extractExperience(sentences: string[]): string[] {
    const experienceKeywords = ['experience', 'work', 'job', 'position', 'role'];
    return sentences.filter(sentence => 
      experienceKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );
  }

  private async enhanceResumeInfo(info: any): Promise<any> {
    const prompt = `
      Enhance the following resume information:
      Name: ${info.name}
      Email: ${info.email}
      Phone: ${info.phone}
      Skills: ${info.skills.join(', ')}
      Education: ${info.education.join(' ')}
      Experience: ${info.experience.join(' ')}

      Please provide:
      1. A brief professional summary
      2. Expanded and categorized skills
      3. Potential job titles this person might be suitable for
      4. Key achievements or projects (if any can be inferred)
      5. Suggested areas for improvement or skill development
    `;

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

      const enhancedInfo = response.data[0].generated_text;
      const parsedInfo = this.parseEnhancedInfo(enhancedInfo);

      return {
        ...info,
        ...parsedInfo,
      };
    } catch (error) {
      this.logger.error(`Error enhancing resume info: ${error.message}`);
      return info;
    }
  }

  private parseEnhancedInfo(enhancedInfo: string): any {
    // Implement parsing logic for the enhanced info
    // This is a placeholder implementation
    return {
      professional_summary: 'Placeholder summary',
      expanded_skills: { technical: [], soft: [] },
      potential_job_titles: [],
      key_achievements: [],
      areas_for_improvement: [],
    };
  }

  private calculateKeywordScore(info: any): number {
    const keywords = ['experience', 'skills', 'education', 'projects', 'achievements'];
    let score = 0;

    for (const keyword of keywords) {
      if (info[keyword] && info[keyword].length > 0) {
        score += 1;
      }
    }

    return score / keywords.length;
  }

  private async calculateMLScore(info: any): Promise<number> {
    const features = this.extractFeatures(info);
    const tensorFeatures = tf.tensor2d([features]);
    const prediction = this.model.predict(tensorFeatures) as tf.Tensor;
    const score = prediction.dataSync()[0];
    return score;
  }

  private calculateNLPScore(info: any): number {
    const text = Object.values(info).flat().join(' ');
    const tokens = this.tokenizer.tokenize(text);
    this.tfidf.addDocument(tokens);
    
    const relevantTerms = ['experience', 'skills', 'education', 'projects', 'achievements'];
    let score = 0;

    for (const term of relevantTerms) {
      score += this.tfidf.tfidf(term, 0);
    }

    return score / relevantTerms.length;
  }

  private calculateSentimentScore(info: any): number {
    const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    const text = Object.values(info).flat().join(' ');
    const sentiment = analyzer.getSentiment(this.tokenizer.tokenize(text));
    return (sentiment + 1) / 2; // Normalize to 0-1 range
  }

  private extractFeatures(info: any): number[] {
    return [
      info.skills.length,
      info.education.length,
      info.experience.length,
      info.professional_summary ? info.professional_summary.length : 0,
      info.expanded_skills ? Object.keys(info.expanded_skills).length : 0,
      info.potential_job_titles ? info.potential_job_titles.length : 0,
      info.key_achievements ? info.key_achievements.length : 0,
    ];
  }

  private async generatePersonalizedFeedback(info: any): Promise<string> {
    const prompt = `
      Based on the following resume information, provide personalized feedback and suggestions for improvement:
      
      Professional Summary: ${info.professional_summary}
      Skills: ${JSON.stringify(info.expanded_skills)}
      Education: ${info.education.join(' ')}
      Experience: ${info.experience.join(' ')}
      Key Achievements: ${info.key_achievements.join(' ')}
      Potential Job Titles: ${info.potential_job_titles.join(', ')}
      Areas for Improvement: ${info.areas_for_improvement.join(', ')}

      Please provide:
      1. Specific strengths of the candidate
      2. Areas where the resume could be improved
      3. Suggestions for skill development
      4. Tips for better presenting their experience
      5. Advice on targeting specific job roles
    `;

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
      this.logger.error(`Error generating personalized feedback: ${error.message}`);
      return 'Unable to generate personalized feedback at this time.';
    }
  }

  async getProcessedResumes(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('processed_resumes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(`Failed to fetch processed resumes: ${error.message}`);
      
      this.logger.log(`Retrieved ${data.length} processed resumes`);
      return data;
    } catch (error) {
      this.logger.error(`Error fetching processed resumes: ${error.message}`);
      throw new Error('Failed to fetch processed resumes');
    }
  }
}
