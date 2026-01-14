-- Database trigger to prevent unauthorized subscription field updates
-- This provides an additional layer of security beyond RLS policies

-- Create function to validate subscription updates
CREATE OR REPLACE FUNCTION validate_subscription_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role TEXT;
  is_service_role BOOLEAN;
BEGIN
  -- Check if this is being called via service role (admin operations)
  -- Service role operations bypass RLS and this trigger should allow them
  -- We detect service role by checking if current_setting('request.jwt.claims', true) is null
  -- or if the role claim indicates service_role
  BEGIN
    current_user_role := current_setting('request.jwt.claims', true)::json->>'role';
    is_service_role := (current_user_role = 'service_role');
  EXCEPTION
    WHEN OTHERS THEN
      is_service_role := false;
  END;

  -- Allow service role (admin operations) to make any changes
  IF is_service_role THEN
    RETURN NEW;
  END IF;

  -- For regular users, enforce restrictions
  -- Prevent changing status unless it's a valid state transition
  -- Users should not be able to change status at all (only admins/service role can)
  IF OLD.status != NEW.status THEN
    RAISE EXCEPTION 'Unauthorized: Users cannot modify subscription status. Attempted to change from % to %', OLD.status, NEW.status
      USING ERRCODE = '42501';
  END IF;

  -- Prevent setting expires_at to NULL
  IF NEW.expires_at IS NULL AND OLD.expires_at IS NOT NULL THEN
    RAISE EXCEPTION 'Unauthorized: Cannot set expires_at to NULL'
      USING ERRCODE = '42501';
  END IF;

  -- Prevent extending expires_at beyond original expiration
  -- Users should not be able to extend their subscription expiration
  IF NEW.expires_at IS NOT NULL AND OLD.expires_at IS NOT NULL THEN
    IF NEW.expires_at > OLD.expires_at THEN
      RAISE EXCEPTION 'Unauthorized: Cannot extend subscription expiration. Attempted to change from % to %', OLD.expires_at, NEW.expires_at
        USING ERRCODE = '42501';
    END IF;
  END IF;

  -- Prevent changing plan_type
  IF OLD.plan_type != NEW.plan_type THEN
    RAISE EXCEPTION 'Unauthorized: Cannot modify subscription plan_type'
      USING ERRCODE = '42501';
  END IF;

  -- Prevent changing user_id
  IF OLD.user_id != NEW.user_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot modify subscription user_id'
      USING ERRCODE = '42501';
  END IF;

  -- Log suspicious update attempts (if audit_logs table exists)
  -- Only log if critical fields were attempted to be changed
  IF (OLD.status != NEW.status OR 
      (OLD.expires_at IS NOT NULL AND (NEW.expires_at IS NULL OR NEW.expires_at > OLD.expires_at)) OR
      OLD.plan_type != NEW.plan_type OR
      OLD.user_id != NEW.user_id) THEN
    BEGIN
      INSERT INTO audit_logs (
        admin_id,
        action_type,
        resource_type,
        resource_id,
        details
      ) VALUES (
        auth.uid(),
        'suspicious_subscription_update_attempt',
        'subscription',
        NEW.id,
        jsonb_build_object(
          'old_status', OLD.status,
          'new_status', NEW.status,
          'old_expires_at', OLD.expires_at,
          'new_expires_at', NEW.expires_at,
          'old_plan_type', OLD.plan_type,
          'new_plan_type', NEW.plan_type,
          'attempted_by', auth.uid()
        )
      );
    EXCEPTION
      WHEN OTHERS THEN
        -- If audit_logs table doesn't exist or insert fails, continue
        -- This is a logging feature, not critical for security
        NULL;
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS prevent_subscription_tampering ON subscriptions;
CREATE TRIGGER prevent_subscription_tampering
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION validate_subscription_update();

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION validate_subscription_update() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_subscription_update() TO anon;
