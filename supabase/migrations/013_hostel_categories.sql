-- Hostel categories junction table (for multiple categories per hostel)
-- Note: categories array already exists in hostels table, but this provides a normalized approach
CREATE TABLE IF NOT EXISTS hostel_category_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hostel_id, category)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hostel_category_mappings_hostel_id ON hostel_category_mappings(hostel_id);
CREATE INDEX IF NOT EXISTS idx_hostel_category_mappings_category ON hostel_category_mappings(category);

-- Note: The categories array in hostels table can be used directly,
-- but this table provides better querying capabilities for complex category filtering
