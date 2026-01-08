-- =====================================================
-- SECURITY REFACTORING: Isolate Sensitive PII
-- =====================================================
-- This migration moves high-risk PII fields to a separate 
-- table with strict RLS policies to reduce exposure risk.
-- =====================================================

-- 1. Create the new sop_sensitive_details table for PII isolation
CREATE TABLE public.sop_sensitive_details (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sop_id uuid NOT NULL REFERENCES public.sops(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  home_address text,
  phone_number text,
  financial_background text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(sop_id) -- 1-to-1 relationship with sops
);

-- 2. Enable Row Level Security (strict - no public access)
ALTER TABLE public.sop_sensitive_details ENABLE ROW LEVEL SECURITY;

-- 3. Create strict RLS policies - users can only access their own data
CREATE POLICY "Users can view their own sensitive details"
ON public.sop_sensitive_details
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sensitive details"
ON public.sop_sensitive_details
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sensitive details"
ON public.sop_sensitive_details
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sensitive details"
ON public.sop_sensitive_details
FOR DELETE
USING (auth.uid() = user_id);

-- 4. Migrate existing data from sops to sop_sensitive_details
INSERT INTO public.sop_sensitive_details (sop_id, user_id, home_address, phone_number, financial_background, created_at, updated_at)
SELECT id, user_id, home_address, phone_number, financial_background, created_at, updated_at
FROM public.sops
WHERE home_address IS NOT NULL OR phone_number IS NOT NULL OR financial_background IS NOT NULL;

-- 5. Create updated_at trigger for the new table
CREATE TRIGGER update_sop_sensitive_details_updated_at
BEFORE UPDATE ON public.sop_sensitive_details
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Add index for faster lookups by sop_id and user_id
CREATE INDEX idx_sop_sensitive_details_sop_id ON public.sop_sensitive_details(sop_id);
CREATE INDEX idx_sop_sensitive_details_user_id ON public.sop_sensitive_details(user_id);