-- Complete fix for RLS policies querying auth.users directly
-- This migration covers all policies missed in previous steps

-- Reports
DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
CREATE POLICY "Admins can view all reports" ON reports FOR SELECT USING (is_admin_user());

-- Promo Codes
DROP POLICY IF EXISTS "Admins can view all promo codes" ON promo_codes;
CREATE POLICY "Admins can view all promo codes" ON promo_codes FOR SELECT USING (is_admin_user());

-- Promo Code Usage
DROP POLICY IF EXISTS "Admins can view all promo usage" ON promo_code_usage;
CREATE POLICY "Admins can view all promo usage" ON promo_code_usage FOR SELECT USING (is_admin_user());

-- Feedback
DROP POLICY IF EXISTS "Admins can view all feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can update feedback" ON feedback;
CREATE POLICY "Admins can view all feedback" ON feedback FOR SELECT USING (is_admin_user());
CREATE POLICY "Admins can update feedback" ON feedback FOR UPDATE USING (is_admin_user());

-- Hostel Category Mappings
DROP POLICY IF EXISTS "Admins can manage category mappings" ON hostel_category_mappings;
CREATE POLICY "Admins can manage category mappings" ON hostel_category_mappings FOR ALL USING (is_admin_user());

-- Room Availability Logs
DROP POLICY IF EXISTS "Admins can view all availability logs" ON room_availability_logs;
DROP POLICY IF EXISTS "Admins can update availability logs" ON room_availability_logs;
CREATE POLICY "Admins can view all availability logs" ON room_availability_logs FOR SELECT USING (is_admin_user());
CREATE POLICY "Admins can update availability logs" ON room_availability_logs FOR UPDATE USING (is_admin_user());

-- Reviews
DROP POLICY IF EXISTS "Users with active subscription can create reviews" ON reviews;
CREATE POLICY "Users with active subscription can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE (
        user_id = auth.uid() OR
        phone = get_user_phone()
      )
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- Storage Objects
DROP POLICY IF EXISTS "Admins can delete" ON storage.objects;
CREATE POLICY "Admins can delete" ON storage.objects FOR DELETE 
USING (bucket_id = 'hostel-images' AND public.is_admin_user());
