export interface Job {
    id: string;
    title: string;
    company: string;
    description: string;
    requirements: string[];
    location: string;
    salary?: string;
    postedDate: Date;
    source: string;
}
