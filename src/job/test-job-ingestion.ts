import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { JobIngestionService } from './job-ingestion.service';
import { Logger } from '@nestjs/common';

async function testJobIngestion() {
  const logger = new Logger('TestJobIngestion');
  let app;
  try {
    app = await NestFactory.create(AppModule);
    const jobIngestionService = app.get(JobIngestionService);

    const testJobId = '3736845912'; // Example LinkedIn job ID
    const testBatchJobIds = ['3736845912', '3736845913', '3736845914']; // Example batch of job IDs

    logger.log('Starting job scraping and ingestion test...');

    // Test single job scraping
    logger.log('Testing single job scraping...');
    const startTime = Date.now();
    const scrapedJob = await jobIngestionService.scrapeAndIngestLinkedInJobs(testJobId);
    const endTime = Date.now();
    logger.log(`Successfully scraped and ingested job in ${endTime - startTime}ms`);
    logger.debug('Scraped job data:', scrapedJob);

    // Test job retrieval from cache
    logger.log('Testing job retrieval from cache...');
    const cachedStartTime = Date.now();
    const cachedJob = await jobIngestionService.scrapeAndIngestLinkedInJobs(testJobId);
    const cachedEndTime = Date.now();
    logger.log(`Retrieved job from cache in ${cachedEndTime - cachedStartTime}ms`);
    logger.debug('Cached job data:', cachedJob);

    // Test batch job scraping
    logger.log('Testing batch job scraping...');
    const batchStartTime = Date.now();
    const batchJobs = await jobIngestionService.batchScrapeAndIngestJobs(testBatchJobIds);
    const batchEndTime = Date.now();
    logger.log(`Successfully scraped and ingested ${batchJobs.length} jobs in ${batchEndTime - batchStartTime}ms`);
    logger.debug('Batch scraped jobs:', batchJobs);

    // Test job listing
    logger.log('Testing job listing...');
    const { jobs, total } = await jobIngestionService.listJobs(1, 10);
    logger.log(`Total jobs in database: ${total}`);
    logger.debug('Sample of stored jobs:', jobs.slice(0, 3));

    logger.log('Job ingestion test completed successfully');
  } catch (error) {
    logger.error('Error during job scraping and ingestion test:', error);
    logger.error('Error stack:', error.stack);
  } finally {
    if (app) {
      await app.close();
    }
  }
}

testJobIngestion().catch(error => {
  console.error('Unhandled error in testJobIngestion:', error);
  console.error('Error stack:', error.stack);
  process.exit(1);
});
