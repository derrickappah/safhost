-- Migration: Viewed and Contacted System Enhancements
-- This migration adds functions and indexes for unique view counting and optimizations

-- Function to check if user has already viewed a hostel
CREATE OR REPLACE FUNCTION has_user_viewed_hostel(
  p_user_id UUID,
  p_subscription_id UUID,
  p_hostel_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_user_id IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM hostel_views
      WHERE user_id = p_user_id AND hostel_id = p_hostel_id
    );
  ELSIF p_subscription_id IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM hostel_views
      WHERE subscription_id = p_subscription_id AND hostel_id = p_hostel_id
    );
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to get unique view count for a user
CREATE OR REPLACE FUNCTION get_user_unique_view_count(
  p_user_id UUID,
  p_subscription_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF p_user_id IS NOT NULL THEN
    SELECT COUNT(DISTINCT hostel_id) INTO v_count
    FROM hostel_views
    WHERE user_id = p_user_id;
  ELSIF p_subscription_id IS NOT NULL THEN
    SELECT COUNT(DISTINCT hostel_id) INTO v_count
    FROM hostel_views
    WHERE subscription_id = p_subscription_id;
  ELSE
    RETURN 0;
  END IF;
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get unique contact count for a user
CREATE OR REPLACE FUNCTION get_user_unique_contact_count(
  p_user_id UUID,
  p_subscription_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF p_user_id IS NOT NULL THEN
    SELECT COUNT(DISTINCT hostel_id) INTO v_count
    FROM contact_logs
    WHERE user_id = p_user_id;
  ELSIF p_subscription_id IS NOT NULL THEN
    SELECT COUNT(DISTINCT hostel_id) INTO v_count
    FROM contact_logs
    WHERE subscription_id = p_subscription_id;
  ELSE
    RETURN 0;
  END IF;
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Update view_count calculation to use unique views
-- This function recalculates view_count based on unique views per hostel
CREATE OR REPLACE FUNCTION recalculate_hostel_view_counts()
RETURNS void AS $$
BEGIN
  UPDATE hostels
  SET view_count = (
    SELECT COUNT(DISTINCT 
      CASE 
        WHEN user_id IS NOT NULL THEN user_id::text || '-' || hostel_id::text
        WHEN subscription_id IS NOT NULL THEN subscription_id::text || '-' || hostel_id::text
        ELSE NULL
      END
    )
    FROM hostel_views
    WHERE hostel_views.hostel_id = hostels.id
  );
END;
$$ LANGUAGE plpgsql;

-- Add composite indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hostel_views_user_hostel ON hostel_views(user_id, hostel_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hostel_views_subscription_hostel ON hostel_views(subscription_id, hostel_id) WHERE subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contact_logs_user_hostel ON contact_logs(user_id, hostel_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contact_logs_subscription_hostel ON contact_logs(subscription_id, hostel_id) WHERE subscription_id IS NOT NULL;

-- Note: The existing indexes on viewed_at and created_at (from migration 005) are sufficient for date filtering
