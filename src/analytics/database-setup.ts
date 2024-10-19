import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class DatabaseSetupService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY'),
    );
  }

  async setupDatabase() {
    const sqlCommands = [
      `
      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT[] NOT NULL,
        location TEXT NOT NULL,
        salary TEXT,
        postedDate TIMESTAMP WITH TIME ZONE NOT NULL,
        lastRelistedDate TIMESTAMP WITH TIME ZONE
      );

      INSERT INTO jobs (title, company, description, requirements, location, salary, postedDate, lastRelistedDate)
      VALUES
        ('Software Engineer', 'TechCorp', 'Develop web applications', ARRAY['JavaScript', 'React', 'Node.js'], 'New York', '100000', NOW() - INTERVAL '20 days', NOW() - INTERVAL '5 days'),
        ('Data Scientist', 'DataInc', 'Analyze large datasets', ARRAY['Python', 'Machine Learning', 'SQL'], 'San Francisco', '120000', NOW() - INTERVAL '35 days', NULL),
        ('Product Manager', 'ProductCo', 'Lead product development', ARRAY['Agile', 'User Research', 'Strategy'], 'Chicago', '110000', NOW() - INTERVAL '15 days', NOW() - INTERVAL '2 days');
      `,
      `
      CREATE TABLE IF NOT EXISTS processed_resumes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        skills TEXT[] NOT NULL,
        experience TEXT[] NOT NULL,
        education TEXT[] NOT NULL
      );

      INSERT INTO processed_resumes (name, email, phone, skills, experience, education)
      VALUES
        ('John Doe', 'john@example.com', '1234567890', ARRAY['JavaScript', 'React', 'Node.js'], ARRAY['5 years at TechCorp'], ARRAY['BS Computer Science']),
        ('Jane Smith', 'jane@example.com', '0987654321', ARRAY['Python', 'Machine Learning', 'SQL'], ARRAY['3 years at DataCo'], ARRAY['MS Data Science']),
        ('Bob Johnson', 'bob@example.com', '1122334455', ARRAY['Agile', 'User Research', 'Product Strategy'], ARRAY['7 years at ProductInc'], ARRAY['MBA']);
      `,
      `
      CREATE TABLE IF NOT EXISTS applicant_job_matches (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        applicant_id UUID REFERENCES processed_resumes(id),
        job_id UUID REFERENCES jobs(id),
        match_score FLOAT NOT NULL
      );

      INSERT INTO applicant_job_matches (applicant_id, job_id, match_score)
      VALUES
        ((SELECT id FROM processed_resumes WHERE name = 'John Doe'), (SELECT id FROM jobs WHERE title = 'Software Engineer'), 0.85),
        ((SELECT id FROM processed_resumes WHERE name = 'Jane Smith'), (SELECT id FROM jobs WHERE title = 'Data Scientist'), 0.92),
        ((SELECT id FROM processed_resumes WHERE name = 'Bob Johnson'), (SELECT id FROM jobs WHERE title = 'Product Manager'), 0.78);
      `
    ];

    for (const sql of sqlCommands) {
      const { error } = await this.supabase.rpc('exec', { sql });
      if (error) {
        console.error('Error executing SQL:', error);
        throw error;
      }
    }

    console.log('Database setup completed successfully');
  }
}
