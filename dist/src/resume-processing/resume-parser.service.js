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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ResumeParserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeParserService = void 0;
const common_1 = require("@nestjs/common");
const natural = __importStar(require("natural"));
let ResumeParserService = ResumeParserService_1 = class ResumeParserService {
    constructor() {
        this.logger = new common_1.Logger(ResumeParserService_1.name);
        this.tokenizer = new natural.WordTokenizer();
    }
    async parseResume(resumeContent) {
        try {
            const sections = this.extractSections(resumeContent);
            const parsedResume = {
                name: this.extractName(sections.header),
                email: this.extractEmail(sections.header),
                phone: this.extractPhone(sections.header),
                skills: this.extractSkills(sections.skills),
                experience: this.extractExperience(sections.experience),
                education: this.extractEducation(sections.education),
            };
            return parsedResume;
        }
        catch (error) {
            this.logger.error(`Error parsing resume: ${error.message}`);
            throw new Error('Failed to parse resume');
        }
    }
    extractSections(content) {
        return {
            header: content.split('\n\n')[0],
            skills: '',
            experience: '',
            education: '',
        };
    }
    extractName(header) {
        return 'John Doe';
    }
    extractEmail(header) {
        return 'john@example.com';
    }
    extractPhone(header) {
        return '123-456-7890';
    }
    extractSkills(skillsSection) {
        return ['JavaScript', 'Python', 'Machine Learning'];
    }
    extractExperience(experienceSection) {
        return ['Software Engineer at TechCorp', 'Data Scientist at DataInc'];
    }
    extractEducation(educationSection) {
        return ['BS in Computer Science, University of Example'];
    }
};
exports.ResumeParserService = ResumeParserService;
exports.ResumeParserService = ResumeParserService = ResumeParserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ResumeParserService);
//# sourceMappingURL=resume-parser.service.js.map