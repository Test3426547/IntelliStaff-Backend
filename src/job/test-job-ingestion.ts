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

    logger.log('Starting job scraping and ingestion test...');
    logger.debug(`Test Job ID: ${testJobId}`);

    const startTime = Date.now();
    logger.log('Scraping and ingesting LinkedIn job...');
    const scrapedJob = await jobIngestionService.scrapeAndIngestLinkedInJobs(testJobId);
    const endTime = Date.now();

    logger.log(`Successfully scraped and ingested job in ${endTime - startTime}ms`);
    logger.debug('Scraped job data:');
    logger.debug(JSON.stringify(scrapedJob, null, 2));

    logger.log('Fetching job from database...');
    const fetchedJob = await jobIngestionService.getJobById(scrapedJob.id);
    logger.log('Fetched job from database:');
    logger.debug(JSON.stringify(fetchedJob, null, 2));

    logger.log('Listing jobs...');
    const { jobs, total } = await jobIngestionService.listJobs(1, 10);
    logger.log(`Total jobs in database: ${total}`);
    logger.debug('Sample of stored jobs:');
    logger.debug(JSON.stringify(jobs.slice(0, 3), null, 2));

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
