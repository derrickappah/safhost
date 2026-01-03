-- Room availability tracking table
CREATE TABLE IF NOT EXISTS room_availability_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  room_type TEXT NOT NULL,
  available_count INTEGER NOT NULL,
  flagged_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  flagged_by_subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT room_availability_user_or_subscription CHECK (
    (flagged_by_user_id IS NOT NULL AND flagged_by_subscription_id IS NULL) OR
    (flagged_by_user_id IS NULL AND flagged_by_subscription_id IS NOT NULL)
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_room_availability_logs_hostel_id ON room_availability_logs(hostel_id);
CREATE INDEX IF NOT EXISTS idx_room_availability_logs_status ON room_availability_logs(status);
CREATE INDEX IF NOT EXISTS idx_room_availability_logs_created_at ON room_availability_logs(created_at DESC);

-- Add updated_at trigger
CREATE TRIGGER update_room_availability_logs_updated_at BEFORE UPDATE ON room_availability_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
