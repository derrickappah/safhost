import { createClient } from '../supabase/server'

const BUCKET_NAME = 'hostel-images'

export interface UploadResult {
  path: string
  url: string
  error?: string
}

/**
 * Upload an image file to Supabase Storage
 */
export async function uploadImage(
  file: File,
  folder: string = 'hostels'
): Promise<UploadResult> {
  try {
    const supabase = await createClient()
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    // Upload file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      return { path: '', url: '', error: error.message }
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)
    
    return {
      path: data.path,
      url: publicUrl
    }
  } catch (error) {
    return {
      path: '',
      url: '',
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

/**
 * Upload multiple images
 */
export async function uploadImages(
  files: File[],
  folder: string = 'hostels'
): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => uploadImage(file, folder))
  return Promise.all(uploadPromises)
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(path: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path])
    
    if (error) {
      return { error: error.message }
    }
    
    return {}
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Delete failed'
    }
  }
}

/**
 * Get public URL for an image path
 */
export function getImageUrl(path: string): string {
  // This is a client-side function, so we use the public URL pattern
  // In production, you'd construct this from your Supabase project URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    return ''
  }
  
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${path}`
}
