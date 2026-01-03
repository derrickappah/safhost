import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/storage/upload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }
    
    const folder = (formData.get('folder') as string) || 'hostels'
    const result = await uploadImage(file, folder)
    
    if (result.error) {
      // Check if error is about bucket not existing
      if (result.error.includes('Bucket') || result.error.includes('bucket') || result.error.includes('not found')) {
        return NextResponse.json(
          { 
            error: 'Storage bucket "hostel-images" not found. Please create it in Supabase Dashboard > Storage, or run the migration file: supabase/migrations/016_storage_bucket.sql' 
          },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      path: result.path,
      url: result.url
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
