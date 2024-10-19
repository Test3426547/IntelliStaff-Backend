import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class ErrorHandlingMonitoringService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(ErrorHandlingMonitoringService.name);
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

  async logError(error: Error, context: string, userId?: string): Promise<void> {
    try {
      const errorId = crypto.randomUUID();
      const { error: supabaseError } = await this.supabase.from('error_logs').insert({
        id: errorId,
        error_message: error.message,
        stack_trace: error.stack,
        context,
        user_id: userId,
        timestamp: new Date().toISOString(),
      });

      if (supabaseError) throw new Error(`Failed to log error: ${supabaseError.message}`);

      this.logger.error(`Error logged: ${errorId} - ${error.message} in context: ${context}`);
    } catch (loggingError) {
      this.logger.error(`Error while logging error: ${loggingError.message}`);
    }
  }

  async getErrorLogs(page: number = 1, limit: number = 50): Promise<{ logs: any[], total: number }> {
    try {
      const { data, error, count } = await this.supabase
        .from('error_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw new Error(`Failed to fetch error logs: ${error.message}`);

      return { logs: data, total: count };
    } catch (error) {
      this.logger.error(`Error fetching error logs: ${error.message}`);
      throw new Error('Failed to fetch error logs');
    }
  }

  async analyzeErrors(timeRange: string): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('error_logs')
        .select('*')
        .gte('timestamp', new Date(Date.now() - this.getTimeRangeInMs(timeRange)).toISOString());

      if (error) throw new Error(`Failed to fetch error logs for analysis: ${error.message}`);

      const analysisPrompt = `
        Analyze the following error logs and provide insights:
        ${JSON.stringify(data)}

        Please provide:
        1. Most common error types
        2. Potential root causes
        3. Recommendations for error prevention
        4. Suggestions for improving system reliability
        5. Any potential security concerns or vulnerabilities
      `;

      const response = await axios.post(
        this.huggingfaceInferenceEndpoint,
        { inputs: analysisPrompt },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingfaceApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data[0].generated_text.trim();
    } catch (error) {
      this.logger.error(`Error analyzing error logs: ${error.message}`);
      throw new Error('Failed to analyze error logs');
    }
  }

  async detectAnomalies(timeRange: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('error_logs')
        .select('*')
        .gte('timestamp', new Date(Date.now() - this.getTimeRangeInMs(timeRange)).toISOString());

      if (error) throw new Error(`Failed to fetch error logs for anomaly detection: ${error.message}`);

      const errorFrequency = {};
      const contextErrorCounts = {};

      // Calculate error frequencies
      data.forEach(log => {
        errorFrequency[log.error_message] = (errorFrequency[log.error_message] || 0) + 1;
        if (!contextErrorCounts[log.context]) {
          contextErrorCounts[log.context] = {};
        }
        contextErrorCounts[log.context][log.error_message] = (contextErrorCounts[log.context][log.error_message] || 0) + 1;
      });

      const totalLogs = data.length;
      const anomalies = [];

      // Detect anomalies
      Object.entries(contextErrorCounts).forEach(([context, errors]) => {
        Object.entries(errors).forEach(([errorMessage, count]) => {
          const averageFrequency = errorFrequency[errorMessage] / Object.keys(contextErrorCounts).length;
          if (count > averageFrequency * 2) { // If the context's error count is more than twice the average
            anomalies.push({
              context,
              errorMessage,
              count,
              averageFrequency,
              severity: 'high',
            });
          }
        });
      });

      return anomalies;
    } catch (error) {
      this.logger.error(`Error detecting anomalies: ${error.message}`);
      throw new Error('Failed to detect anomalies');
    }
  }

  private getTimeRangeInMs(timeRange: string): number {
    const [amount, unit] = timeRange.split(' ');
    const amountNum = parseInt(amount);
    switch (unit) {
      case 'hour':
      case 'hours':
        return amountNum * 60 * 60 * 1000;
      case 'day':
      case 'days':
        return amountNum * 24 * 60 * 60 * 1000;
      case 'week':
      case 'weeks':
        return amountNum * 7 * 24 * 60 * 60 * 1000;
      default:
        throw new Error('Invalid time range');
    }
  }
}
