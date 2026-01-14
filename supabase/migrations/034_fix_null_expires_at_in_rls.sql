-- Fix RLS policies to exclude NULL expires_at from active subscriptions
-- NULL expires_at should be treated as expired/invalid for security

-- Fix Reviews policy
DROP POLICY IF EXISTS "Users with active subscription can create reviews" ON reviews;
CREATE POLICY "Users with active subscription can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE (
        user_id = auth.uid() OR
        phone = get_user_phone()
      )
      AND status = 'active'
      AND expires_at IS NOT NULL
      AND expires_at > NOW()
    )
  );

-- Fix Favorites policy
DROP POLICY IF EXISTS "Users with active subscription can create favorites" ON favorites;
CREATE POLICY "Users with active subscription can create favorites"
  ON favorites FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR
    subscription_id IN (
      SELECT id FROM subscriptions
      WHERE status = 'active'
      AND expires_at IS NOT NULL
      AND expires_at > NOW()
    )
  );
