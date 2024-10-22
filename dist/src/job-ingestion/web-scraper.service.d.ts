export declare class WebScraperService {
    private readonly logger;
    scrapeJobs(url: string, maxJobs?: number): Promise<any[]>;
    private scrapeJobsFromPage;
    private goToNextPage;
    private delay;
}
