export declare class ResumeParserService {
    private readonly logger;
    private tokenizer;
    constructor();
    parseResume(resumeContent: string): Promise<any>;
    private extractSections;
    private extractName;
    private extractEmail;
    private extractPhone;
    private extractSkills;
    private extractExperience;
    private extractEducation;
}
