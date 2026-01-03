-- Create storage bucket for hostel images
-- Note: This requires the storage extension to be enabled
-- Run this in Supabase SQL Editor or via CLI

-- Create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hostel-images',
  'hostel-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'hostel-images');

-- Allow authenticated users to upload
CREATE POLICY IF NOT EXISTS "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hostel-images' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own uploads
CREATE POLICY IF NOT EXISTS "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hostel-images' AND
  auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'hostel-images' AND
  auth.role() = 'authenticated'
);

-- Allow admins to delete
CREATE POLICY IF NOT EXISTS "Admins can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hostel-images' AND
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);
