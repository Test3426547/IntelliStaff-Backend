CREATE TABLE IF NOT EXISTS public.processed_resumes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_path TEXT NOT NULL,
  extracted_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.processed_resumes ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON public.processed_resumes
  FOR ALL USING (auth.role() = 'authenticated');
