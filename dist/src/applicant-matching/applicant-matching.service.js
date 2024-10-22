"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ApplicantMatchingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicantMatchingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const terminus_1 = require("@nestjs/terminus");
const common_utils_1 = require("../common/common-utils");
const axios_1 = __importDefault(require("axios"));
let ApplicantMatchingService = ApplicantMatchingService_1 = class ApplicantMatchingService extends terminus_1.HealthIndicator {
    constructor(configService) {
        super();
        this.configService = configService;
        this.logger = new common_1.Logger(ApplicantMatchingService_1.name);
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_KEY'));
        this.huggingfaceApiKey = this.configService.get('HUGGINGFACE_API_KEY');
        this.huggingfaceInferenceEndpoint = this.configService.get('HUGGINGFACE_INFERENCE_ENDPOINT');
    }
    async checkHealth() {
        try {
            const { data, error } = await this.supabase.from('applicant_matches').select('id').limit(1);
            if (error)
                throw error;
            return this.getStatus('applicant_matching_db', true, { message: 'ApplicantMatching Service DB is healthy' });
        }
        catch (error) {
            this.logger.error(`Health check failed: ${error.message}`);
            throw new terminus_1.HealthCheckError('ApplicantMatching Service DB check failed', error);
        }
    }
    async retryOperation(operation, maxRetries = 3) {
        return common_utils_1.CommonUtils.retryOperation(operation, maxRetries);
    }
    async matchApplicantToJob(applicantId, jobId) {
        return this.retryOperation(async () => {
            try {
                const applicant = await this.getApplicant(applicantId);
                const job = await this.getJob(jobId);
                const matchScore = await this.calculateMatchScore(applicant, job);
                const skillMatch = await this.calculateSkillMatch(applicant.skills, job.required_skills);
                const experienceMatch = this.calculateExperienceMatch(applicant.experience, job.required_experience);
                const matchResult = {
                    applicant_id: applicantId,
                    job_id: jobId,
                    match_score: matchScore,
                    skill_match: skillMatch,
                    experience_match: experienceMatch,
                };
                const { data, error } = await this.supabase
                    .from('applicant_matches')
                    .insert(matchResult)
                    .single();
                if (error)
                    throw new Error(`Failed to match applicant to job: ${error.message}`);
                return data;
            }
            catch (error) {
                this.logger.error(`Error matching applicant to job: ${error.message}`);
                throw common_utils_1.CommonUtils.handleError(error);
            }
        });
    }
    async getMatchesForApplicant(applicantId) {
        return this.retryOperation(async () => {
            try {
                const { data, error } = await this.supabase
                    .from('applicant_matches')
                    .select('*, jobs(*)')
                    .eq('applicant_id', applicantId)
                    .order('match_score', { ascending: false });
                if (error)
                    throw new Error(`Failed to get matches for applicant: ${error.message}`);
                return data;
            }
            catch (error) {
                this.logger.error(`Error getting matches for applicant: ${error.message}`);
                throw common_utils_1.CommonUtils.handleError(error);
            }
        });
    }
    async getMatchesForJob(jobId) {
        return this.retryOperation(async () => {
            try {
                const { data, error } = await this.supabase
                    .from('applicant_matches')
                    .select('*, applicants(*)')
                    .eq('job_id', jobId)
                    .order('match_score', { ascending: false });
                if (error)
                    throw new Error(`Failed to get matches for job: ${error.message}`);
                return data;
            }
            catch (error) {
                this.logger.error(`Error getting matches for job: ${error.message}`);
                throw common_utils_1.CommonUtils.handleError(error);
            }
        });
    }
    async removeMatch(matchId) {
        return this.retryOperation(async () => {
            try {
                const { error } = await this.supabase
                    .from('applicant_matches')
                    .delete()
                    .eq('id', matchId);
                if (error)
                    throw new Error(`Failed to remove match: ${error.message}`);
            }
            catch (error) {
                this.logger.error(`Error removing match: ${error.message}`);
                throw common_utils_1.CommonUtils.handleError(error);
            }
        });
    }
    async getApplicant(applicantId) {
        const { data, error } = await this.supabase
            .from('applicants')
            .select('*')
            .eq('id', applicantId)
            .single();
        if (error)
            throw new Error(`Failed to fetch applicant: ${error.message}`);
        return data;
    }
    async getJob(jobId) {
        const { data, error } = await this.supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single();
        if (error)
            throw new Error(`Failed to fetch job: ${error.message}`);
        return data;
    }
    async calculateMatchScore(applicant, job) {
        const prompt = `
      Applicant: ${JSON.stringify(applicant)}
      Job: ${JSON.stringify(job)}
      
      Based on the applicant's profile and the job requirements, calculate a match score between 0 and 100.
      Consider factors such as skills, experience, education, and any other relevant information.
      Provide only the numeric score as the response.
    `;
        try {
            const response = await axios_1.default.post(this.huggingfaceInferenceEndpoint, { inputs: prompt }, {
                headers: {
                    'Authorization': `Bearer ${this.huggingfaceApiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            const score = parseFloat(response.data[0].generated_text.trim());
            return isNaN(score) ? 0 : Math.min(Math.max(score, 0), 100);
        }
        catch (error) {
            this.logger.error(`Error calculating match score: ${error.message}`);
            return 0;
        }
    }
    async calculateSkillMatch(applicantSkills, jobSkills) {
        const prompt = `
      Applicant skills: ${applicantSkills.join(', ')}
      Job required skills: ${jobSkills.join(', ')}
      
      Calculate the skill match percentage between the applicant's skills and the job's required skills.
      Consider both exact matches and related skills. Provide only the numeric percentage as the response.
    `;
        try {
            const response = await axios_1.default.post(this.huggingfaceInferenceEndpoint, { inputs: prompt }, {
                headers: {
                    'Authorization': `Bearer ${this.huggingfaceApiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            const score = parseFloat(response.data[0].generated_text.trim());
            return isNaN(score) ? 0 : Math.min(Math.max(score, 0), 100);
        }
        catch (error) {
            this.logger.error(`Error calculating skill match: ${error.message}`);
            return 0;
        }
    }
    calculateExperienceMatch(applicantExperience, jobRequiredExperience) {
        if (applicantExperience >= jobRequiredExperience) {
            return 100;
        }
        else {
            return (applicantExperience / jobRequiredExperience) * 100;
        }
    }
    async generateMatchReport(matchId) {
        try {
            const { data: match, error } = await this.supabase
                .from('applicant_matches')
                .select('*, applicants(*), jobs(*)')
                .eq('id', matchId)
                .single();
            if (error)
                throw new Error(`Failed to fetch match data: ${error.message}`);
            const prompt = `
        Generate a detailed match report for the following applicant and job:
        
        Applicant: ${JSON.stringify(match.applicants)}
        Job: ${JSON.stringify(match.jobs)}
        Match Score: ${match.match_score}
        Skill Match: ${match.skill_match}
        Experience Match: ${match.experience_match}
        
        Provide a comprehensive analysis of the match, including:
        1. Overall suitability of the applicant for the job
        2. Strengths and weaknesses of the applicant in relation to the job requirements
        3. Specific skills that make the applicant a good fit
        4. Areas where the applicant might need additional training or development
        5. Recommendations for the hiring manager
        
        Format the report in a clear and professional manner.
      `;
            const response = await axios_1.default.post(this.huggingfaceInferenceEndpoint, { inputs: prompt }, {
                headers: {
                    'Authorization': `Bearer ${this.huggingfaceApiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data[0].generated_text.trim();
        }
        catch (error) {
            this.logger.error(`Error generating match report: ${error.message}`);
            throw new common_1.InternalServerErrorException('Failed to generate match report');
        }
    }
};
exports.ApplicantMatchingService = ApplicantMatchingService;
exports.ApplicantMatchingService = ApplicantMatchingService = ApplicantMatchingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ApplicantMatchingService);
//# sourceMappingURL=applicant-matching.service.js.map