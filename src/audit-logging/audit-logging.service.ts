import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';

@Injectable()
export class AuditLoggingService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(AuditLoggingService.name);
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

  async logAction(userId: string, action: string, details: any): Promise<void> {
    try {
      const { error } = await this.supabase.from('audit_logs').insert({
        user_id: userId,
        action,
        details,
        timestamp: new Date().toISOString(),
      });

      if (error) throw new Error(`Failed to log action: ${error.message}`);

      this.logger.log(`Action logged: ${action} by user ${userId}`);
    } catch (error) {
      this.logger.error(`Error logging action: ${error.message}`);
      throw new Error('Failed to log action');
    }
  }

  async getAuditLogs(page: number = 1, limit: number = 50): Promise<{ logs: any[], total: number }> {
    try {
      const { data, error, count } = await this.supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw new Error(`Failed to fetch audit logs: ${error.message}`);

      return { logs: data, total: count };
    } catch (error) {
      this.logger.error(`Error fetching audit logs: ${error.message}`);
      throw new Error('Failed to fetch audit logs');
    }
  }

  async analyzeAuditLogs(timeRange: string): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .gte('timestamp', new Date(Date.now() - this.getTimeRangeInMs(timeRange)).toISOString());

      if (error) throw new Error(`Failed to fetch audit logs for analysis: ${error.message}`);

      const analysisPrompt = `
        Analyze the following audit logs and provide insights:
        ${JSON.stringify(data)}

        Please provide:
        1. Most common actions
        2. Unusual patterns or behaviors
        3. Potential security concerns
        4. Recommendations for improving system usage and security
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
      this.logger.error(`Error analyzing audit logs: ${error.message}`);
      throw new Error('Failed to analyze audit logs');
    }
  }

  async detectAnomalies(timeRange: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('audit_logs')
        .select('*')
        .gte('timestamp', new Date(Date.now() - this.getTimeRangeInMs(timeRange)).toISOString());

      if (error) throw new Error(`Failed to fetch audit logs for anomaly detection: ${error.message}`);

      const actionFrequency = {};
      const userActionCounts = {};

      // Calculate action frequencies
      data.forEach(log => {
        actionFrequency[log.action] = (actionFrequency[log.action] || 0) + 1;
        if (!userActionCounts[log.user_id]) {
          userActionCounts[log.user_id] = {};
        }
        userActionCounts[log.user_id][log.action] = (userActionCounts[log.user_id][log.action] || 0) + 1;
      });

      const totalLogs = data.length;
      const anomalies = [];

      // Detect anomalies
      Object.entries(userActionCounts).forEach(([userId, actions]) => {
        Object.entries(actions).forEach(([action, count]) => {
          const averageFrequency = actionFrequency[action] / Object.keys(userActionCounts).length;
          if (count > averageFrequency * 2) { // If the user's action count is more than twice the average
            anomalies.push({
              userId,
              action,
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
