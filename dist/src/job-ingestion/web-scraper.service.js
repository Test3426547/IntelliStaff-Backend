"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var WebScraperService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebScraperService = void 0;
const common_1 = require("@nestjs/common");
const puppeteer = __importStar(require("puppeteer"));
let WebScraperService = WebScraperService_1 = class WebScraperService {
    constructor() {
        this.logger = new common_1.Logger(WebScraperService_1.name);
    }
    async scrapeJobs(url, maxJobs = 100) {
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
                    await this.delay(2000);
                    pageNum++;
                    this.logger.log(`Scraping page ${pageNum}`);
                }
            }
            this.logger.log(`Scraped ${jobs.length} jobs successfully`);
            return jobs;
        }
        catch (error) {
            this.logger.error(`Error during web scraping: ${error.message}`, error.stack);
            throw new Error(`Web scraping failed: ${error.message}`);
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
    async scrapeJobsFromPage(page) {
        return page.evaluate(() => {
            const jobElements = document.querySelectorAll('.job-listing');
            return Array.from(jobElements).map((el) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
                return ({
                    title: (_b = (_a = el.querySelector('.job-title')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim(),
                    company: (_d = (_c = el.querySelector('.company-name')) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim(),
                    description: (_f = (_e = el.querySelector('.job-description')) === null || _e === void 0 ? void 0 : _e.textContent) === null || _f === void 0 ? void 0 : _f.trim(),
                    requirements: Array.from(el.querySelectorAll('.job-requirements li')).map(req => { var _a; return (_a = req.textContent) === null || _a === void 0 ? void 0 : _a.trim(); }),
                    location: (_h = (_g = el.querySelector('.job-location')) === null || _g === void 0 ? void 0 : _g.textContent) === null || _h === void 0 ? void 0 : _h.trim(),
                    salary: (_k = (_j = el.querySelector('.job-salary')) === null || _j === void 0 ? void 0 : _j.textContent) === null || _k === void 0 ? void 0 : _k.trim(),
                    postedDate: (_m = (_l = el.querySelector('.job-date')) === null || _l === void 0 ? void 0 : _l.textContent) === null || _m === void 0 ? void 0 : _m.trim(),
                    url: (_o = el.querySelector('a.job-link')) === null || _o === void 0 ? void 0 : _o.getAttribute('href'),
                });
            });
        });
    }
    async goToNextPage(page) {
        const nextButton = await page.$('.pagination .next');
        if (nextButton) {
            await nextButton.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
            return true;
        }
        return false;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
exports.WebScraperService = WebScraperService;
exports.WebScraperService = WebScraperService = WebScraperService_1 = __decorate([
    (0, common_1.Injectable)()
], WebScraperService);
//# sourceMappingURL=web-scraper.service.js.map