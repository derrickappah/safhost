-- Fix RLS policies that were incorrectly querying auth.users directly
-- This migration ensures all policies use SECURITY DEFINER functions to access user metadata

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
    AND (raw_user_meta_data->>'role' = 'admin')
  );
END;
$$;

-- Create a function to get current user's phone from metadata
CREATE OR REPLACE FUNCTION get_user_phone()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT raw_user_meta_data->>'phone'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$;

-- Grant execute permission on the functions
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_user() TO anon;
GRANT EXECUTE ON FUNCTION get_user_phone() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_phone() TO anon;

-- Fix Schools policies
DROP POLICY IF EXISTS "Only admins can insert schools" ON schools;
DROP POLICY IF EXISTS "Only admins can update schools" ON schools;
DROP POLICY IF EXISTS "Only admins can delete schools" ON schools;

CREATE POLICY "Only admins can insert schools" ON schools FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Only admins can update schools" ON schools FOR UPDATE USING (is_admin_user());
CREATE POLICY "Only admins can delete schools" ON schools FOR DELETE USING (is_admin_user());

-- Fix Hostels policies
DROP POLICY IF EXISTS "Only admins can insert hostels" ON hostels;
DROP POLICY IF EXISTS "Only admins can update hostels" ON hostels;
DROP POLICY IF EXISTS "Only admins can delete hostels" ON hostels;

CREATE POLICY "Only admins can insert hostels" ON hostels FOR INSERT WITH CHECK (is_admin_user());
CREATE POLICY "Only admins can update hostels" ON hostels FOR UPDATE USING (is_admin_user());
CREATE POLICY "Only admins can delete hostels" ON hostels FOR DELETE USING (is_admin_user());

-- Fix Subscriptions policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;

CREATE POLICY "Users can view their own subscriptions" ON subscriptions FOR SELECT 
USING (user_id = auth.uid() OR phone = get_user_phone());
CREATE POLICY "Admins can view all subscriptions" ON subscriptions FOR SELECT USING (is_admin_user());

-- Fix Favorites policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

CREATE POLICY "Users can view their own favorites" ON favorites FOR SELECT 
USING (user_id = auth.uid() OR subscription_id IN (
  SELECT id FROM subscriptions WHERE user_id = auth.uid() OR phone = get_user_phone()
));
CREATE POLICY "Users can delete their own favorites" ON favorites FOR DELETE 
USING (user_id = auth.uid() OR subscription_id IN (
  SELECT id FROM subscriptions WHERE user_id = auth.uid() OR phone = get_user_phone()
));

-- Fix Payments policies
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;

CREATE POLICY "Users can view their own payments" ON payments FOR SELECT 
USING (subscription_id IN (
  SELECT id FROM subscriptions WHERE user_id = auth.uid() OR phone = get_user_phone()
));
CREATE POLICY "Admins can view all payments" ON payments FOR SELECT USING (is_admin_user());

-- Fix Reports policies
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Users can create reports" ON reports;
DROP POLICY IF EXISTS "Admins can update reports" ON reports;

CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (user_id = auth.uid() OR is_admin_user());
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin_user());
CREATE POLICY "Admins can update reports" ON reports FOR UPDATE USING (is_admin_user());

-- Fix Contact Logs policies
DROP POLICY IF EXISTS "Users can view own contact logs" ON contact_logs;
DROP POLICY IF EXISTS "Users can create contact logs" ON contact_logs;

CREATE POLICY "Users can view own contact logs" ON contact_logs FOR SELECT USING (user_id = auth.uid() OR is_admin_user());
CREATE POLICY "Users can create contact logs" ON contact_logs FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin_user());

-- Fix Hostel Views policies
DROP POLICY IF EXISTS "Users can view own hostel views" ON hostel_views;
DROP POLICY IF EXISTS "Users can create hostel views" ON hostel_views;

CREATE POLICY "Users can view own hostel views" ON hostel_views FOR SELECT USING (user_id = auth.uid() OR is_admin_user());
CREATE POLICY "Users can create hostel views" ON hostel_views FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin_user());

-- Fix Promo Codes policies
DROP POLICY IF EXISTS "Admins can manage promo codes" ON promo_codes;
CREATE POLICY "Admins can manage promo codes" ON promo_codes FOR ALL USING (is_admin_user());

-- Fix Promo Code Usage policies
DROP POLICY IF EXISTS "Users can view own promo code usage" ON promo_code_usage;
DROP POLICY IF EXISTS "Users can create promo code usage" ON promo_code_usage;

CREATE POLICY "Users can view own promo code usage" ON promo_code_usage FOR SELECT USING (user_id = auth.uid() OR is_admin_user());
CREATE POLICY "Users can create promo code usage" ON promo_code_usage FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin_user());

-- Fix Banned Users policies
DROP POLICY IF EXISTS "Admins can manage banned users" ON banned_users;
CREATE POLICY "Admins can manage banned users" ON banned_users FOR ALL USING (is_admin_user());

-- Fix Audit Logs policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (is_admin_user());

-- Fix Feedback policies
DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can create feedback" ON feedback;

CREATE POLICY "Users can view own feedback" ON feedback FOR SELECT USING (user_id = auth.uid() OR is_admin_user());
CREATE POLICY "Users can create feedback" ON feedback FOR INSERT WITH CHECK (user_id = auth.uid() OR is_admin_user());

-- Fix Hostel Category Mappings policies
DROP POLICY IF EXISTS "Admins can manage hostel category mappings" ON hostel_category_mappings;
CREATE POLICY "Admins can manage hostel category mappings" ON hostel_category_mappings FOR ALL USING (is_admin_user());

-- Fix Room Availability Logs policies
DROP POLICY IF EXISTS "Users can view own room availability logs" ON room_availability_logs;
DROP POLICY IF EXISTS "Admins can update room availability logs" ON room_availability_logs;

CREATE POLICY "Users can view own room availability logs" ON room_availability_logs FOR SELECT USING (flagged_by_user_id = auth.uid() OR is_admin_user());
CREATE POLICY "Admins can update room availability logs" ON room_availability_logs FOR UPDATE USING (is_admin_user());

-- Fix Profiles policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin_user());
