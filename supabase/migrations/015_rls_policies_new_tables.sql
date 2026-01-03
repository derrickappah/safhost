-- Enable RLS on new tables
ALTER TABLE contact_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_category_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_availability_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Contact Logs Policies
CREATE POLICY "Users can view own contact logs" ON contact_logs
  FOR SELECT USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can create contact logs" ON contact_logs
  FOR INSERT WITH CHECK (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Hostel Views Policies
CREATE POLICY "Users can view own hostel views" ON hostel_views
  FOR SELECT USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can create hostel views" ON hostel_views
  FOR INSERT WITH CHECK (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Reports Policies
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update reports" ON reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can create notifications" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Promo Codes Policies
CREATE POLICY "Everyone can view active promo codes" ON promo_codes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage promo codes" ON promo_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Promo Code Usage Policies
CREATE POLICY "Users can view own promo code usage" ON promo_code_usage
  FOR SELECT USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can create promo code usage" ON promo_code_usage
  FOR INSERT WITH CHECK (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Banned Users Policies
CREATE POLICY "Admins can manage banned users" ON banned_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Audit Logs Policies
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "System can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Feedback Policies
CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can create feedback" ON feedback
  FOR INSERT WITH CHECK (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- User Sessions Policies
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own sessions" ON user_sessions
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own sessions" ON user_sessions
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Hostel Category Mappings Policies
CREATE POLICY "Everyone can view hostel category mappings" ON hostel_category_mappings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage hostel category mappings" ON hostel_category_mappings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Room Availability Logs Policies
CREATE POLICY "Users can view own room availability logs" ON room_availability_logs
  FOR SELECT USING (
    flagged_by_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can create room availability logs" ON room_availability_logs
  FOR INSERT WITH CHECK (
    flagged_by_user_id = auth.uid() OR
    flagged_by_user_id IS NULL
  );

CREATE POLICY "Admins can update room availability logs" ON room_availability_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Profiles Policies (already handled in migration 016, but adding here for completeness)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
