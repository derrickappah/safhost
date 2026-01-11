-- Add status column to reviews table for approval system
ALTER TABLE reviews 
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved' 
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_status_hostel ON reviews(hostel_id, status);

-- Add constraint: comment is required for ratings less than 2
ALTER TABLE reviews
  ADD CONSTRAINT reviews_comment_required_low_rating 
  CHECK (
    (rating >= 2) OR (rating < 2 AND comment IS NOT NULL AND comment != '')
  );

-- Update existing reviews: set status to 'approved' if not set
UPDATE reviews SET status = 'approved' WHERE status IS NULL;

-- Update the hostel rating calculation function to only count approved reviews
CREATE OR REPLACE FUNCTION update_hostel_rating()
RETURNS TRIGGER AS $$
DECLARE
  calculated_rating DECIMAL(3, 2);
  review_count_val INTEGER;
  hostel_id_val UUID;
BEGIN
  -- Get the hostel_id (works for INSERT, UPDATE, and DELETE)
  hostel_id_val := COALESCE(NEW.hostel_id, OLD.hostel_id);
  
  -- Calculate average rating and round to 2 decimal places
  -- Only count approved reviews
  -- Handle case where there are no approved reviews (AVG returns NULL)
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 0::DECIMAL(3, 2)
      ELSE LEAST(GREATEST(ROUND(AVG(rating::DECIMAL), 2)::DECIMAL(3, 2), 0), 5)
    END,
    COUNT(*)
  INTO calculated_rating, review_count_val
  FROM reviews
  WHERE hostel_id = hostel_id_val
    AND status = 'approved';
  
  -- Update the hostel with calculated values
  UPDATE hostels
  SET 
    rating = calculated_rating,
    review_count = review_count_val
  WHERE id = hostel_id_val;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Recalculate all hostel ratings based only on approved reviews
UPDATE hostels
SET 
  rating = COALESCE(
    LEAST(
      GREATEST(
        ROUND(
          (SELECT AVG(rating::DECIMAL) FROM reviews WHERE reviews.hostel_id = hostels.id AND reviews.status = 'approved'),
          2
        )::DECIMAL(3, 2),
        0
      ),
      5
    ),
    0
  ),
  review_count = (SELECT COUNT(*) FROM reviews WHERE reviews.hostel_id = hostels.id AND reviews.status = 'approved');
