-- Create hostel_schools function table
CREATE TABLE IF NOT EXISTS hostel_schools (
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  distance DECIMAL(5, 2), -- distance in km specific to this school
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (hostel_id, school_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_hostel_schools_hostel_id ON hostel_schools(hostel_id);
CREATE INDEX IF NOT EXISTS idx_hostel_schools_school_id ON hostel_schools(school_id);

-- Migrate existing data: Insert current hostel.school_id as the first entry in hostel_schools
INSERT INTO hostel_schools (hostel_id, school_id, distance)
SELECT id, school_id, distance
FROM hostels
WHERE school_id IS NOT NULL
ON CONFLICT (hostel_id, school_id) DO NOTHING;
