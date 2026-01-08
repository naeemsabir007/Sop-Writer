-- Create enum for payment methods
CREATE TYPE public.payment_method AS ENUM ('jazzcash', 'easypaisa', 'hbl');

-- Create enum for verification status
CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected');

-- Create the payment_verifications table
CREATE TABLE public.payment_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_method payment_method NOT NULL,
  sender_name TEXT NOT NULL,
  transaction_id TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  screenshot_url TEXT,
  status verification_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  sop_id UUID REFERENCES public.sops(id) ON DELETE SET NULL,
  package_tier TEXT CHECK (package_tier IN ('standard', 'expert')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_verifications ENABLE ROW LEVEL SECURITY;

-- Users can insert their own rows
CREATE POLICY "Users can insert their own payment verifications"
ON public.payment_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view only their own rows
CREATE POLICY "Users can view their own payment verifications"
ON public.payment_verifications
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all rows
CREATE POLICY "Admins can view all payment verifications"
ON public.payment_verifications
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all rows
CREATE POLICY "Admins can update all payment verifications"
ON public.payment_verifications
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_payment_verifications_updated_at
BEFORE UPDATE ON public.payment_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to approve payment verification
CREATE OR REPLACE FUNCTION public.approve_payment_verification(
  p_verification_id UUID,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_verification RECORD;
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Get the verification record
  SELECT * INTO v_verification
  FROM public.payment_verifications
  WHERE id = p_verification_id;

  IF v_verification IS NULL THEN
    RAISE EXCEPTION 'Payment verification not found';
  END IF;

  -- Update verification status
  UPDATE public.payment_verifications
  SET status = 'approved',
      admin_notes = COALESCE(p_admin_notes, admin_notes),
      updated_at = now()
  WHERE id = p_verification_id;

  -- If there's an associated SOP, mark it as paid
  IF v_verification.sop_id IS NOT NULL THEN
    UPDATE public.sops
    SET payment_status = 'paid',
        package_tier = COALESCE(v_verification.package_tier, 'standard'),
        is_locked = true,
        updated_at = now()
    WHERE id = v_verification.sop_id
      AND user_id = v_verification.user_id;
  END IF;

  -- Update user's premium status
  UPDATE public.profiles
  SET is_premium = true,
      updated_at = now()
  WHERE id = v_verification.user_id;

  RETURN true;
END;
$$;

-- Create function to reject payment verification
CREATE OR REPLACE FUNCTION public.reject_payment_verification(
  p_verification_id UUID,
  p_admin_notes TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Update verification status
  UPDATE public.payment_verifications
  SET status = 'rejected',
      admin_notes = p_admin_notes,
      updated_at = now()
  WHERE id = p_verification_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment verification not found';
  END IF;

  RETURN true;
END;
$$;

-- Create index for faster queries
CREATE INDEX idx_payment_verifications_status ON public.payment_verifications(status);
CREATE INDEX idx_payment_verifications_user_id ON public.payment_verifications(user_id);
CREATE INDEX idx_payment_verifications_created_at ON public.payment_verifications(created_at DESC);