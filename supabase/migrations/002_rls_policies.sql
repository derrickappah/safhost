-- Enable Row Level Security on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Schools: Public read access
CREATE POLICY "Schools are viewable by everyone"
  ON schools FOR SELECT
  USING (true);

-- Schools: Only authenticated admins can insert/update/delete
CREATE POLICY "Only admins can insert schools"
  ON schools FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can update schools"
  ON schools FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can delete schools"
  ON schools FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Hostels: Public read access for active hostels
CREATE POLICY "Active hostels are viewable by everyone"
  ON hostels FOR SELECT
  USING (is_active = true);

-- Hostels: Only admins can insert/update/delete
CREATE POLICY "Only admins can insert hostels"
  ON hostels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can update hostels"
  ON hostels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can delete hostels"
  ON hostels FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Subscriptions: Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (
    user_id = auth.uid() OR
    subscription_id IN (
      SELECT id FROM subscriptions
      WHERE phone = (SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = auth.uid())
    )
  );

-- Subscriptions: Anyone can create subscriptions (for anonymous users)
CREATE POLICY "Anyone can create subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (true);

-- Subscriptions: Users can update their own subscriptions
CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions FOR UPDATE
  USING (user_id = auth.uid());

-- Subscriptions: Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Favorites: Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (
    user_id = auth.uid() OR
    subscription_id IN (
      SELECT id FROM subscriptions
      WHERE user_id = auth.uid() OR
      phone = (SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = auth.uid())
    )
  );

-- Favorites: Users with active subscription can create favorites
CREATE POLICY "Users with active subscription can create favorites"
  ON favorites FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR
    subscription_id IN (
      SELECT id FROM subscriptions
      WHERE status = 'active' AND expires_at > NOW()
    )
  );

-- Favorites: Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (
    user_id = auth.uid() OR
    subscription_id IN (
      SELECT id FROM subscriptions
      WHERE user_id = auth.uid() OR
      phone = (SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = auth.uid())
    )
  );

-- Reviews: Public read access
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

-- Reviews: Users with active subscription can create reviews
CREATE POLICY "Users with active subscription can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR
    subscription_id IN (
      SELECT id FROM subscriptions
      WHERE status = 'active' AND expires_at > NOW()
    )
  );

-- Reviews: Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (user_id = auth.uid());

-- Reviews: Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (user_id = auth.uid());

-- Payments: Users can view their own payments
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (
    subscription_id IN (
      SELECT id FROM subscriptions
      WHERE user_id = auth.uid() OR
      phone = (SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = auth.uid())
    )
  );

-- Payments: Anyone can create payments (for payment processing)
CREATE POLICY "Anyone can create payments"
  ON payments FOR INSERT
  WITH CHECK (true);

-- Payments: Service role can update payments (for webhooks)
-- Note: This requires service role key, handled in API routes

-- Payments: Admins can view all payments
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
