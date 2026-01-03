-- Create function to get user emails from auth.users
-- This function is needed to display reviewer names in reviews
CREATE OR REPLACE FUNCTION get_user_emails(user_ids UUID[])
RETURNS TABLE(id UUID, email TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_emails(UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_emails(UUID[]) TO anon;
