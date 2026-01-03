# Supabase Database Setup

This directory contains SQL migration files for setting up the database schema.

## Running Migrations

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order:
   - `001_initial_schema.sql` - Creates all tables, indexes, and triggers
   - `002_rls_policies.sql` - Sets up Row Level Security policies

### Option 2: Using Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Database Schema

### Tables
- **schools** - School information
- **hostels** - Hostel listings
- **subscriptions** - User subscriptions (supports anonymous users)
- **favorites** - Saved hostels
- **reviews** - Hostel reviews
- **payments** - Payment records

### Key Features
- UUID primary keys
- Automatic `updated_at` timestamps
- Automatic rating calculation for hostels
- Row Level Security (RLS) enabled on all tables
- Indexes for performance optimization

## Storage Setup

After running migrations, set up Supabase Storage:

1. Go to Storage in Supabase Dashboard
2. Create a new bucket named `hostel-images`
3. Set it to **Public**
4. Add the following policy:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'hostel-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hostel-images' AND
  auth.role() = 'authenticated'
);

-- Allow admins to delete
CREATE POLICY "Admins can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hostel-images' AND
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);
```

## Admin User Setup

To create an admin user:

1. Sign up a user through Supabase Auth
2. Run this SQL in the SQL Editor:

```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('role', 'admin')
WHERE email = 'your-admin-email@example.com';
```

## Notes

- The schema supports both authenticated users and anonymous subscriptions
- Subscriptions can be linked to either a user_id or tracked by phone/email
- All tables have RLS policies for security
- Hostel ratings are automatically calculated from reviews
