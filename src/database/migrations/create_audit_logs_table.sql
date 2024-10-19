CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON public.audit_logs
  FOR ALL USING (auth.role() = 'authenticated');

-- Create an index on the timestamp column for faster queries
CREATE INDEX audit_logs_timestamp_idx ON public.audit_logs (timestamp);
