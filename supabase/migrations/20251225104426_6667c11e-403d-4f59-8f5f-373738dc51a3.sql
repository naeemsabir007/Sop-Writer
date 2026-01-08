-- Create sops table
CREATE TABLE public.sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country TEXT NOT NULL,
  university TEXT NOT NULL,
  course TEXT NOT NULL,
  degree_level TEXT NOT NULL,
  current_qualification TEXT,
  academic_score TEXT,
  ielts_score TEXT,
  gap_years INTEGER DEFAULT 0,
  motivation TEXT,
  financial_background TEXT,
  future_goals TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  generated_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sops ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only view their own SOPs
CREATE POLICY "Users can view their own sops"
ON public.sops
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own SOPs
CREATE POLICY "Users can insert their own sops"
ON public.sops
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own SOPs
CREATE POLICY "Users can update their own sops"
ON public.sops
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own SOPs
CREATE POLICY "Users can delete their own sops"
ON public.sops
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_sops_updated_at
BEFORE UPDATE ON public.sops
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();