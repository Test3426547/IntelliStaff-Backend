const puppeteer = require('puppeteer');

async function scrapeLinkedInJob(url) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const jobData = await page.evaluate(() => {
      const title = document.querySelector('.top-card-layout__title')?.textContent.trim();
      const company = document.querySelector('.topcard__org-name-link')?.textContent.trim();
      const location = document.querySelector('.topcard__flavor--bullet')?.textContent.trim();
      const description = document.querySelector('.description__text')?.textContent.trim();
      const postedDate = document.querySelector('.posted-time-ago__text')?.textContent.trim();
      const jobType = document.querySelector('.description__job-criteria-text')?.textContent.trim();
      const applicants = document.querySelector('.num-applicants__caption')?.textContent.trim();
      const salary = document.querySelector('.compensation__salary')?.textContent.trim();
      const skills = Array.from(document.querySelectorAll('.skill-pill')).map(skill => skill.textContent.trim());

      return { title, company, location, description, postedDate, jobType, applicants, salary, skills, url };
    });

    return jobData;
  } catch (error) {
    console.error('Error scraping LinkedIn job:', error);
    throw new Error(`Failed to scrape LinkedIn job: ${error.message}`);
  } finally {
    await browser.close();
  }
}

async function scrapeLinkedInJobs(searchUrl, limit = 10) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  try {
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    const jobLinks = await page.evaluate((limit) => {
      const links = Array.from(document.querySelectorAll('.job-card-container__link'));
      return links.slice(0, limit).map(link => link.href);
    }, limit);

    const jobs = [];
    for (const link of jobLinks) {
      try {
        const jobData = await scrapeLinkedInJob(link);
        jobs.push(jobData);
      } catch (error) {
        console.error(`Error scraping job at ${link}:`, error);
      }
    }

    return jobs;
  } catch (error) {
    console.error('Error scraping LinkedIn jobs:', error);
    throw new Error(`Failed to scrape LinkedIn jobs: ${error.message}`);
  } finally {
    await browser.close();
  }
}

async function scrapeLinkedInCompany(companyUrl) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  try {
    await page.goto(companyUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    const companyData = await page.evaluate(() => {
      const name = document.querySelector('.org-top-card-summary__title')?.textContent.trim();
      const industry = document.querySelector('.org-top-card-summary-info-list__info-item')?.textContent.trim();
      const employeeCount = document.querySelector('.org-about-company-module__company-staff-count-range')?.textContent.trim();
      const description = document.querySelector('.org-about-us-organization-description__text')?.textContent.trim();

      return { name, industry, employeeCount, description, url: window.location.href };
    });

    return companyData;
  } catch (error) {
    console.error('Error scraping LinkedIn company:', error);
    throw new Error(`Failed to scrape LinkedIn company: ${error.message}`);
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeLinkedInJob, scrapeLinkedInJobs, scrapeLinkedInCompany };
