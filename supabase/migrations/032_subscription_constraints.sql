-- Add database constraint to prevent NULL expires_at for active subscriptions
-- This provides database-level enforcement that active subscriptions must have an expiration date

-- Add CHECK constraint
ALTER TABLE subscriptions 
ADD CONSTRAINT check_active_subscription_has_expiration 
CHECK (
  status != 'active' OR expires_at IS NOT NULL
);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT check_active_subscription_has_expiration ON subscriptions IS 
'Active subscriptions must have a non-null expiration date for security. NULL expires_at is treated as expired/invalid.';
