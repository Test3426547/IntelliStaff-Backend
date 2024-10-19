-- Create revoked_tokens table
CREATE TABLE IF NOT EXISTS public.revoked_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  token TEXT NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(token)
);

-- Create index on token for faster lookups
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_token ON public.revoked_tokens(token);

-- Create security_logs table
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  event TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Create index on user_id and timestamp for faster queries
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id_timestamp ON public.security_logs(user_id, timestamp);

-- Create error_logs table
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  context TEXT,
  user_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Create index on timestamp for faster queries
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON public.error_logs(timestamp);

-- Enable Row Level Security on all tables
ALTER TABLE public.revoked_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users on revoked_tokens" ON public.revoked_tokens
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users on security_logs" ON public.security_logs
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users on error_logs" ON public.error_logs
  FOR ALL USING (auth.role() = 'authenticated');
