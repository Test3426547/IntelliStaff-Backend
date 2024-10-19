import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JobIngestionService } from './job/job-ingestion.service';
import { Logger } from '@nestjs/common';

async function testJobIngestion() {
  const logger = new Logger('TestJobIngestion');
  const app = await NestFactory.create(AppModule);
  const jobIngestionService = app.get(JobIngestionService);

  const testUrl = 'https://www.linkedin.com/jobs/search/?currentJobId=4045387424&distance=25&geoId=104769905&keywords=it%20support&origin=JOBS_HOME_KEYWORD_HISTORY&refresh=true';

  try {
    logger.log('Starting job scraping and ingestion test...');
    logger.debug(`Test URL: ${testUrl}`);

    const startTime = Date.now();
    const scrapedJobs = await jobIngestionService.scrapeAndIngestLinkedInJobs(testUrl, 5);
    const endTime = Date.now();

    logger.log(`Successfully scraped and ingested ${scrapedJobs.length} jobs in ${endTime - startTime}ms`);

    // Check if jobs are stored in the database
    const { jobs, total } = await jobIngestionService.listJobs(1, 10);
    logger.log(`Total jobs in database: ${total}`);
    logger.debug('Sample of stored jobs:');
    logger.debug(JSON.stringify(jobs.slice(0, 3), null, 2));

    // Test getting a specific job
    if (jobs.length > 0) {
      const testJobId = jobs[0].id;
      logger.debug(`Testing getJobById with job ID: ${testJobId}`);
      const fetchedJob = await jobIngestionService.getJobById(testJobId);
      logger.debug(`Fetched job: ${JSON.stringify(fetchedJob, null, 2)}`);
    }

    logger.log('Job ingestion test completed successfully');
  } catch (error) {
    logger.error('Error during job scraping and ingestion test:', error);
  } finally {
    await app.close();
  }
}

testJobIngestion().catch(error => {
  console.error('Unhandled error in testJobIngestion:', error);
  process.exit(1);
});
