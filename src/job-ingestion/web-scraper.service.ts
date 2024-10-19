import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class WebScraperService {
  private readonly logger = new Logger(WebScraperService.name);

  async scrapeJobs(url: string, maxJobs: number = 100): Promise<any[]> {
    let browser;
    try {
      this.logger.log(`Starting web scraping from ${url}`);
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

      let jobs = [];
      let hasNextPage = true;
      let pageNum = 1;

      while (hasNextPage && jobs.length < maxJobs) {
        const pageJobs = await this.scrapeJobsFromPage(page);
        jobs = jobs.concat(pageJobs).slice(0, maxJobs);

        hasNextPage = await this.goToNextPage(page);
        if (hasNextPage) {
          await this.delay(2000); // Add a 2-second delay between pages
          pageNum++;
          this.logger.log(`Scraping page ${pageNum}`);
        }
      }

      this.logger.log(`Scraped ${jobs.length} jobs successfully`);
      return jobs;
    } catch (error) {
      this.logger.error(`Error during web scraping: ${error.message}`, error.stack);
      throw new Error(`Web scraping failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private async scrapeJobsFromPage(page: puppeteer.Page): Promise<any[]> {
    return page.evaluate(() => {
      const jobElements = document.querySelectorAll('.job-listing');
      return Array.from(jobElements).map((el) => ({
        title: el.querySelector('.job-title')?.textContent?.trim(),
        company: el.querySelector('.company-name')?.textContent?.trim(),
        description: el.querySelector('.job-description')?.textContent?.trim(),
        requirements: Array.from(el.querySelectorAll('.job-requirements li')).map(req => req.textContent?.trim()),
        location: el.querySelector('.job-location')?.textContent?.trim(),
        salary: el.querySelector('.job-salary')?.textContent?.trim(),
        postedDate: el.querySelector('.job-date')?.textContent?.trim(),
        url: el.querySelector('a.job-link')?.getAttribute('href'),
      }));
    });
  }

  private async goToNextPage(page: puppeteer.Page): Promise<boolean> {
    const nextButton = await page.$('.pagination .next');
    if (nextButton) {
      await nextButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      return true;
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
