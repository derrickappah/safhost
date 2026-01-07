-- App Settings table for storing application-wide configuration
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for settings
CREATE POLICY "Settings are viewable by everyone"
  ON app_settings FOR SELECT
  USING (true);

-- Only admins can insert/update/delete settings
CREATE POLICY "Only admins can insert settings"
  ON app_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can update settings"
  ON app_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can delete settings"
  ON app_settings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Insert default settings
INSERT INTO app_settings (key, value, description)
VALUES 
  ('advertisement_enabled', 'true'::jsonb, 'Enable/disable advertisement section in bottom navigation')
ON CONFLICT (key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);
