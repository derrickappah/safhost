-- Contact logs table for tracking "Contact Hostel Manager" clicks
CREATE TABLE IF NOT EXISTS contact_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT contact_logs_user_or_subscription CHECK (
    (user_id IS NOT NULL AND subscription_id IS NULL) OR
    (user_id IS NULL AND subscription_id IS NOT NULL)
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contact_logs_hostel_id ON contact_logs(hostel_id);
CREATE INDEX IF NOT EXISTS idx_contact_logs_user_id ON contact_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_logs_subscription_id ON contact_logs(subscription_id);
CREATE INDEX IF NOT EXISTS idx_contact_logs_created_at ON contact_logs(created_at DESC);
