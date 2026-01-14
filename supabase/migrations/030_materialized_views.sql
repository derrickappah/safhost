-- Materialized views for performance optimization
-- These views pre-compute expensive queries and refresh periodically

-- Materialized view for featured hostels
-- Refreshes every 5 minutes via cron job or on-demand
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_featured_hostels AS
SELECT 
  h.id,
  h.school_id,
  h.name,
  h.price_min,
  h.price_max,
  h.rating,
  h.review_count,
  h.distance,
  h.images,
  h.amenities,
  h.is_active,
  h.created_at,
  h.view_count,
  h.gender_restriction,
  h.is_available,
  h.featured,
  h.latitude,
  h.longitude,
  jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'location', s.location,
    'latitude', s.latitude,
    'longitude', s.longitude,
    'logo_url', s.logo_url
  ) as school
FROM hostels h
LEFT JOIN schools s ON h.school_id = s.id
WHERE h.is_active = true 
  AND h.featured = true 
  AND h.is_available = true
ORDER BY h.rating DESC, h.view_count DESC NULLS LAST;

-- Index on materialized view for faster queries
CREATE INDEX IF NOT EXISTS idx_mv_featured_hostels_rating 
ON mv_featured_hostels(rating DESC, view_count DESC NULLS LAST);

-- Materialized view for popular hostels (by view count)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_popular_hostels AS
SELECT 
  h.id,
  h.school_id,
  h.name,
  h.price_min,
  h.price_max,
  h.rating,
  h.review_count,
  h.distance,
  h.images,
  h.amenities,
  h.is_active,
  h.created_at,
  h.view_count,
  h.gender_restriction,
  h.is_available,
  h.featured,
  h.latitude,
  h.longitude,
  jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'location', s.location,
    'latitude', s.latitude,
    'longitude', s.longitude,
    'logo_url', s.logo_url
  ) as school
FROM hostels h
LEFT JOIN schools s ON h.school_id = s.id
WHERE h.is_active = true 
  AND h.is_available = true
ORDER BY h.view_count DESC NULLS LAST, h.rating DESC;

-- Index on materialized view
CREATE INDEX IF NOT EXISTS idx_mv_popular_hostels_views 
ON mv_popular_hostels(view_count DESC NULLS LAST, rating DESC);

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_featured_hostels;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_popular_hostels;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT ON mv_featured_hostels TO authenticated;
GRANT SELECT ON mv_popular_hostels TO authenticated;

-- Note: To refresh these views automatically, set up a cron job:
-- SELECT cron.schedule('refresh-hostel-views', '*/5 * * * *', 'SELECT refresh_materialized_views();');
-- Or refresh on-demand when hostels are updated
