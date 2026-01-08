-- Add contact details columns to sops table
ALTER TABLE public.sops
ADD COLUMN full_name text,
ADD COLUMN phone_number text,
ADD COLUMN email text,
ADD COLUMN home_address text;