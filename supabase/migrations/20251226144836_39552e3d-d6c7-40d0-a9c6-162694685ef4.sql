-- Create promo_codes table
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percentage')),
  discount_value INTEGER NOT NULL CHECK (discount_value > 0),
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Admin can do full CRUD
CREATE POLICY "Admins can select promo codes"
ON public.promo_codes
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert promo codes"
ON public.promo_codes
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update promo codes"
ON public.promo_codes
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete promo codes"
ON public.promo_codes
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create secure RPC function for users to validate promo codes (no direct table access)
CREATE OR REPLACE FUNCTION public.validate_promo_code(p_code TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_type TEXT,
  discount_value INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_promo RECORD;
BEGIN
  -- Look up the promo code (case-insensitive)
  SELECT * INTO v_promo
  FROM public.promo_codes
  WHERE UPPER(code) = UPPER(p_code);

  -- Check if code exists
  IF v_promo IS NULL THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::INTEGER, 'Invalid or Expired Code'::TEXT;
    RETURN;
  END IF;

  -- Check if active
  IF NOT v_promo.is_active THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::INTEGER, 'Invalid or Expired Code'::TEXT;
    RETURN;
  END IF;

  -- Check expiry
  IF v_promo.expires_at IS NOT NULL AND v_promo.expires_at < now() THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::INTEGER, 'Invalid or Expired Code'::TEXT;
    RETURN;
  END IF;

  -- Check usage limit
  IF v_promo.max_uses IS NOT NULL AND v_promo.current_uses >= v_promo.max_uses THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::INTEGER, 'This code has been fully redeemed.'::TEXT;
    RETURN;
  END IF;

  -- Valid code - return discount details
  RETURN QUERY SELECT true, v_promo.discount_type, v_promo.discount_value, NULL::TEXT;
END;
$$;

-- Create function to increment promo code usage (called after successful payment)
CREATE OR REPLACE FUNCTION public.increment_promo_usage(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.promo_codes
  SET current_uses = current_uses + 1,
      updated_at = now()
  WHERE UPPER(code) = UPPER(p_code)
    AND is_active = true
    AND (expires_at IS NULL OR expires_at >= now())
    AND (max_uses IS NULL OR current_uses < max_uses);

  RETURN FOUND;
END;
$$;

-- Update trigger for updated_at
CREATE TRIGGER update_promo_codes_updated_at
BEFORE UPDATE ON public.promo_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();