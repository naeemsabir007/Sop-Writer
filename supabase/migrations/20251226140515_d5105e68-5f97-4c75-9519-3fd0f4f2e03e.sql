-- Drop legacy sensitive columns from sops table (data already migrated to sop_sensitive_details)
ALTER TABLE public.sops 
DROP COLUMN IF EXISTS phone_number,
DROP COLUMN IF EXISTS home_address,
DROP COLUMN IF EXISTS financial_background;