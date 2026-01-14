-- Fix subscription update policy to prevent users from modifying status and expires_at
-- This migration replaces the permissive update policy with a restricted one
-- Note: Field-level restrictions are enforced by the trigger in migration 031
-- This policy only ensures users can only update their own subscriptions

-- Drop the existing permissive update policy
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;

-- Create a new restricted policy that only allows users to update their own subscriptions
-- The trigger (prevent_subscription_tampering) will enforce field-level restrictions
-- This policy ensures ownership, while the trigger prevents modification of critical fields
CREATE POLICY "Users can update their own subscription contact info"
  ON subscriptions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can still update subscriptions via service role (bypasses RLS)
-- This is handled in application code using createServiceRoleClient()
