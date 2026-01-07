-- Create a function to check if current user is admin
-- This function has SECURITY DEFINER so it can access auth.users
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_user() TO anon;

-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can insert settings" ON app_settings;
DROP POLICY IF EXISTS "Only admins can update settings" ON app_settings;
DROP POLICY IF EXISTS "Only admins can delete settings" ON app_settings;

-- Recreate policies using the function
CREATE POLICY "Only admins can insert settings"
  ON app_settings FOR INSERT
  WITH CHECK (is_admin_user());

CREATE POLICY "Only admins can update settings"
  ON app_settings FOR UPDATE
  USING (is_admin_user());

CREATE POLICY "Only admins can delete settings"
  ON app_settings FOR DELETE
  USING (is_admin_user());
