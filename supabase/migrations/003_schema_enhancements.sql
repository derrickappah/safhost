-- Add new columns to hostels table for enhanced filtering

-- Add gender restriction
ALTER TABLE hostels 
ADD COLUMN IF NOT EXISTS gender_restriction TEXT CHECK (gender_restriction IN ('male', 'female', 'mixed'));

-- Add availability flag
ALTER TABLE hostels 
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Add view count
ALTER TABLE hostels 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add featured flag
ALTER TABLE hostels 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Add categories array (for multiple types per hostel)
ALTER TABLE hostels 
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';

-- Create index for gender restriction
CREATE INDEX IF NOT EXISTS idx_hostels_gender_restriction ON hostels(gender_restriction);

-- Create index for availability
CREATE INDEX IF NOT EXISTS idx_hostels_is_available ON hostels(is_available);

-- Create index for featured
CREATE INDEX IF NOT EXISTS idx_hostels_featured ON hostels(featured);

-- Create index for view count (for sorting by popularity)
CREATE INDEX IF NOT EXISTS idx_hostels_view_count ON hostels(view_count DESC);
