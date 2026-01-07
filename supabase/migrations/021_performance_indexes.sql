-- Performance optimization indexes
-- These indexes improve query performance for common query patterns

-- Composite index for filtering active hostels by school (common query pattern)
CREATE INDEX IF NOT EXISTS idx_hostels_active_school 
ON hostels(is_active, school_id) 
WHERE is_active = true;

-- Composite index for sorting hostels by rating when active
CREATE INDEX IF NOT EXISTS idx_hostels_active_rating 
ON hostels(is_active, rating DESC) 
WHERE is_active = true;

-- Composite index for favorites lookup (user_id + hostel_id) - improves batch favorite checks
CREATE INDEX IF NOT EXISTS idx_favorites_user_hostel 
ON favorites(user_id, hostel_id);

-- Composite index for subscriptions lookup (user_id + status) - improves subscription checks
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status 
ON subscriptions(user_id, status);

-- Index for price range queries on hostels
CREATE INDEX IF NOT EXISTS idx_hostels_price_min 
ON hostels(price_min) 
WHERE is_active = true;

-- Index for distance queries on hostels
CREATE INDEX IF NOT EXISTS idx_hostels_distance 
ON hostels(distance) 
WHERE is_active = true AND distance IS NOT NULL;

-- Index for gender restriction queries
CREATE INDEX IF NOT EXISTS idx_hostels_gender_restriction 
ON hostels(gender_restriction) 
WHERE is_active = true AND gender_restriction IS NOT NULL;

-- Index for availability queries
CREATE INDEX IF NOT EXISTS idx_hostels_is_available 
ON hostels(is_available) 
WHERE is_active = true;

-- Composite index for hostel views by user (improves recently viewed queries)
CREATE INDEX IF NOT EXISTS idx_hostel_views_user_viewed_at 
ON hostel_views(user_id, viewed_at DESC) 
WHERE user_id IS NOT NULL;

-- Composite index for hostel views by subscription (improves recently viewed queries)
CREATE INDEX IF NOT EXISTS idx_hostel_views_subscription_viewed_at 
ON hostel_views(subscription_id, viewed_at DESC) 
WHERE subscription_id IS NOT NULL;

-- Index for profiles role lookup (improves admin checks)
CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON profiles(role) 
WHERE role = 'admin';
