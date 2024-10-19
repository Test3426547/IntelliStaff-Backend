import { Injectable } from '@nestjs/common';
import * as simpleParser from 'mailparser';

@Injectable()
export class EmailParserService {
  async extractResumeFromEmail(emailContent: string): Promise<string> {
    try {
      const parsed = await simpleParser(emailContent);
      
      // Check for attachments
      if (parsed.attachments && parsed.attachments.length > 0) {
        const resumeAttachment = parsed.attachments.find(attachment => 
          attachment.filename.toLowerCase().includes('resume') || 
          attachment.filename.toLowerCase().includes('cv')
        );

        if (resumeAttachment) {
          return resumeAttachment.content.toString('utf-8');
        }
      }

      // If no attachment, return the email body
      return parsed.text || '';
    } catch (error) {
      throw new Error(`Failed to parse email: ${error.message}`);
    }
  }
}
