import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as amqp from 'amqplib';
import * as https from 'https';

@Injectable()
export class JobIngestionService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(JobIngestionService.name);
  private rabbitmqConnection: amqp.Connection;
  private rabbitmqChannel: amqp.Channel;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
    this.initializeRabbitMQ();
  }

  private async initializeRabbitMQ() {
    try {
      this.rabbitmqConnection = await amqp.connect(this.configService.get<string>('RABBITMQ_URL'));
      this.rabbitmqChannel = await this.rabbitmqConnection.createChannel();
      await this.rabbitmqChannel.assertQueue('job_ingestion', { durable: true });
      this.logger.log('RabbitMQ connection established');
    } catch (error) {
      this.logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
    }
  }

  async ingestJob(jobData: any) {
    try {
      const { data, error } = await this.supabase.from('jobs').insert(jobData);
      if (error) throw new Error(`Failed to ingest job: ${error.message}`);
      
      await this.rabbitmqChannel.sendToQueue('job_ingestion', Buffer.from(JSON.stringify(data)));
      this.logger.log(`Job ingested and sent to queue: ${data[0].id}`);
      
      return data[0];
    } catch (error) {
      this.logger.error(`Error ingesting job: ${error.message}`);
      throw error;
    }
  }

  async scrapeJobsFromWebsite(url: string) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', async () => {
          try {
            // Simple extraction of job titles (this should be replaced with proper parsing)
            const jobTitles = data.match(/<h2>(.*?)<\/h2>/g) || [];
            const jobs = jobTitles.map(title => ({
              title: title.replace(/<\/?h2>/g, ''),
              source_url: url
            }));
            
            for (const job of jobs) {
              await this.ingestJob(job);
            }
            
            resolve(jobs);
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  async processJobQueue() {
    try {
      await this.rabbitmqChannel.consume('job_ingestion', async (msg) => {
        if (msg !== null) {
          const jobData = JSON.parse(msg.content.toString());
          // Process the job data (e.g., enrich, validate, etc.)
          this.logger.log(`Processing job: ${jobData.id}`);
          // Acknowledge the message
          this.rabbitmqChannel.ack(msg);
        }
      });
    } catch (error) {
      this.logger.error(`Error processing job queue: ${error.message}`);
    }
  }
}
