-- Hostel views tracking table
CREATE TABLE IF NOT EXISTS hostel_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT hostel_views_user_or_subscription CHECK (
    (user_id IS NOT NULL AND subscription_id IS NULL) OR
    (user_id IS NULL AND subscription_id IS NOT NULL)
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hostel_views_hostel_id ON hostel_views(hostel_id);
CREATE INDEX IF NOT EXISTS idx_hostel_views_user_id ON hostel_views(user_id);
CREATE INDEX IF NOT EXISTS idx_hostel_views_subscription_id ON hostel_views(subscription_id);
CREATE INDEX IF NOT EXISTS idx_hostel_views_viewed_at ON hostel_views(viewed_at DESC);

-- Function to update hostel view_count
CREATE OR REPLACE FUNCTION update_hostel_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE hostels
  SET view_count = (
    SELECT COUNT(*)
    FROM hostel_views
    WHERE hostel_id = NEW.hostel_id
  )
  WHERE id = NEW.hostel_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update view_count on insert
CREATE TRIGGER update_hostel_view_count_on_view
  AFTER INSERT ON hostel_views
  FOR EACH ROW EXECUTE FUNCTION update_hostel_view_count();

-- Function to increment view count (for real-time updates)
CREATE OR REPLACE FUNCTION increment_hostel_view_count(hostel_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE hostels
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = hostel_id;
END;
$$ LANGUAGE plpgsql;
