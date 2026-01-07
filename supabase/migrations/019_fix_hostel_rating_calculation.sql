-- Fix hostel rating calculation to ensure proper rounding and bounds
-- The previous function didn't explicitly round to 2 decimal places or ensure bounds

-- Drop and recreate the function with improved calculation
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
  -- Handle case where there are no reviews (AVG returns NULL)
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 0::DECIMAL(3, 2)
      ELSE LEAST(GREATEST(ROUND(AVG(rating::DECIMAL), 2)::DECIMAL(3, 2), 0), 5)
    END,
    COUNT(*)
  INTO calculated_rating, review_count_val
  FROM reviews
  WHERE hostel_id = hostel_id_val;
  
  -- Update the hostel with calculated values
  UPDATE hostels
  SET 
    rating = calculated_rating,
    review_count = review_count_val
  WHERE id = hostel_id_val;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Recalculate all hostel ratings to fix any existing incorrect values
UPDATE hostels
SET 
  rating = COALESCE(
    LEAST(
      GREATEST(
        ROUND(
          (SELECT AVG(rating::DECIMAL) FROM reviews WHERE reviews.hostel_id = hostels.id),
          2
        )::DECIMAL(3, 2),
        0
      ),
      5
    ),
    0
  ),
  review_count = (SELECT COUNT(*) FROM reviews WHERE reviews.hostel_id = hostels.id);
