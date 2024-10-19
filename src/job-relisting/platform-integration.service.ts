import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Job } from '../common/interfaces/job.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PlatformIntegrationService {
  private readonly logger = new Logger(PlatformIntegrationService.name);
  private rateLimits: Map<string, { lastCall: number, limit: number }> = new Map();

  constructor(private configService: ConfigService) {
    // Initialize rate limits for different platforms
    this.rateLimits.set('seek', { lastCall: 0, limit: 5000 }); // 5 seconds
    this.rateLimits.set('indeed', { lastCall: 0, limit: 10000 }); // 10 seconds
    this.rateLimits.set('linkedin', { lastCall: 0, limit: 15000 }); // 15 seconds
  }

  async relistJob(job: Job): Promise<Job> {
    const platforms = ['seek', 'indeed', 'linkedin'];
    const relistedPlatforms = [];

    for (const platform of platforms) {
      try {
        await this.checkRateLimit(platform);
        await this.postJobToPlatform(platform, job);
        relistedPlatforms.push(platform);
        this.logger.log(`Job successfully relisted on ${platform}`);
      } catch (error) {
        this.logger.error(`Failed to relist job on ${platform}: ${error.message}`);
      }
    }

    return {
      ...job,
      relistedPlatforms,
    };
  }

  private async checkRateLimit(platform: string): Promise<void> {
    const rateLimit = this.rateLimits.get(platform);
    if (!rateLimit) return;

    const now = Date.now();
    const timeSinceLastCall = now - rateLimit.lastCall;

    if (timeSinceLastCall < rateLimit.limit) {
      const delay = rateLimit.limit - timeSinceLastCall;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    rateLimit.lastCall = Date.now();
  }

  private async postJobToPlatform(platform: string, job: Job): Promise<void> {
    const apiUrl = this.configService.get<string>(`${platform.toUpperCase()}_API_URL`);
    const apiKey = this.configService.get<string>(`${platform.toUpperCase()}_API_KEY`);

    if (!apiUrl || !apiKey) {
      throw new Error(`Missing configuration for ${platform}`);
    }

    try {
      await axios.post(apiUrl, job, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      throw new Error(`API call to ${platform} failed: ${error.message}`);
    }
  }
}
