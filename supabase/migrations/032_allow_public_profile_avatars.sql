-- Allow users to view avatar_url from any profile for reviews display
-- This is public information that should be visible in reviews
-- Note: RLS policies apply to rows, not columns, so we allow SELECT on all rows
-- but in practice, we only query for id and avatar_url in the reviews action
-- The existing "Users can view own profile" policy is kept for backward compatibility

-- Allow everyone to view profile avatars (for reviews)
-- This policy allows viewing profile data needed for displaying reviews
-- Multiple SELECT policies are combined with OR, so users can still view their own profile
CREATE POLICY "Everyone can view profile avatars for reviews" ON profiles
  FOR SELECT USING (true);

-- Note: Users can still only UPDATE their own profile due to the existing UPDATE policy
