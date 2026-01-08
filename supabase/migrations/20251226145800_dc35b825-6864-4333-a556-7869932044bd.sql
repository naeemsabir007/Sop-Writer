-- PHASE 1: Add columns to enforce pay-per-application immutability

-- Add payment-related columns to sops table
ALTER TABLE public.sops 
ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
ADD COLUMN IF NOT EXISTS package_tier TEXT CHECK (package_tier IN ('standard', 'expert')),
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false;

-- Create a function to enforce immutability on paid SOPs
CREATE OR REPLACE FUNCTION public.enforce_sop_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the SOP is paid/locked, prevent changes to locked fields
  IF OLD.payment_status = 'paid' OR OLD.is_locked = true THEN
    -- Check if protected fields are being changed
    IF OLD.university IS DISTINCT FROM NEW.university OR
       OLD.country IS DISTINCT FROM NEW.country OR
       OLD.course IS DISTINCT FROM NEW.course OR
       OLD.degree_level IS DISTINCT FROM NEW.degree_level THEN
      RAISE EXCEPTION 'Cannot modify university, country, course, or degree level on a paid SOP. These fields are locked.';
    END IF;
    
    -- Prevent unlocking or changing payment status back to pending
    IF NEW.is_locked = false AND OLD.is_locked = true THEN
      RAISE EXCEPTION 'Cannot unlock a paid SOP.';
    END IF;
    
    IF NEW.payment_status = 'pending' AND OLD.payment_status = 'paid' THEN
      RAISE EXCEPTION 'Cannot revert payment status on a paid SOP.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_enforce_sop_immutability ON public.sops;

CREATE TRIGGER trigger_enforce_sop_immutability
BEFORE UPDATE ON public.sops
FOR EACH ROW
EXECUTE FUNCTION public.enforce_sop_immutability();

-- Create function to mark SOP as paid (to be called after successful payment)
CREATE OR REPLACE FUNCTION public.mark_sop_as_paid(
  p_sop_id UUID,
  p_package_tier TEXT DEFAULT 'standard'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Update the SOP - only if it belongs to the user and is not already paid
  UPDATE public.sops
  SET 
    payment_status = 'paid',
    package_tier = p_package_tier,
    is_locked = true,
    updated_at = now()
  WHERE id = p_sop_id 
    AND user_id = v_user_id
    AND payment_status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SOP not found, already paid, or does not belong to user';
  END IF;
  
  RETURN true;
END;
$$;