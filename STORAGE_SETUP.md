# Storage Bucket Setup Guide

## Quick Setup

The storage bucket for hostel images needs to be created in your Supabase project. Follow these steps:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Enter the following:
   - **Name**: `hostel-images`
   - **Public bucket**: ✅ Check this box (make it public)
   - **File size limit**: `5 MB` (or 5242880 bytes)
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp`
5. Click **"Create bucket"**

### Option 2: Using SQL Migration

Run the migration file in Supabase SQL Editor:

1. Go to **SQL Editor** in Supabase Dashboard
2. Open the file: `supabase/migrations/016_storage_bucket.sql`
3. Copy and paste the SQL into the editor
4. Click **"Run"**

### Option 3: Using Supabase CLI

```bash
# Make sure you're in the project root
supabase db push
```

## Storage Policies

After creating the bucket, the migration will automatically set up these policies:

- **Public Access**: Anyone can view/download images
- **Authenticated Upload**: Only authenticated users can upload images
- **Admin Delete**: Only admins can delete images

## Verify Setup

To verify the bucket is set up correctly:

1. Go to **Storage** > **hostel-images** in Supabase Dashboard
2. Try uploading a test image through the admin panel
3. Check that the image appears in the bucket

## Troubleshooting

### Error: "Bucket not found"
- Make sure the bucket name is exactly `hostel-images` (case-sensitive)
- Verify the bucket exists in Storage section

### Error: "Permission denied"
- Check that the storage policies are set up correctly
- Verify your user has the correct role (authenticated/admin)

### Images not displaying
- Check that the bucket is set to **Public**
- Verify the image URLs are correct
- Check browser console for CORS errors
