-- Fix reviews RLS policy to require active subscription
-- The previous policy allowed any authenticated user to create reviews
-- This migration updates it to require both authentication AND an active subscription

-- Drop the old policy
DROP POLICY IF EXISTS "Users with active subscription can create reviews" ON reviews;

-- Create the corrected policy that requires:
-- 1. user_id matches the authenticated user
-- 2. The user has an active subscription (checking both user_id and phone to match subscription lookup pattern)
-- Note: If expires_at is NULL, the subscription is considered active (no expiration)
CREATE POLICY "Users with active subscription can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE (
        user_id = auth.uid() OR
        phone = (SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = auth.uid())
      )
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );
