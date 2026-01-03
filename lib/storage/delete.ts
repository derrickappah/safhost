import { createClient } from '../supabase/server'

const BUCKET_NAME = 'hostel-images'

/**
 * Delete multiple images from Supabase Storage
 */
export async function deleteImages(paths: string[]): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(paths)
    
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
 * Delete all images for a hostel
 */
export async function deleteHostelImages(hostelId: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    
    // Get hostel to find image paths
    const { data: hostel, error: fetchError } = await supabase
      .from('hostels')
      .select('images')
      .eq('id', hostelId)
      .single()
    
    if (fetchError || !hostel) {
      return { error: 'Hostel not found' }
    }
    
    // Extract paths from image URLs
    const paths = hostel.images
      .map((url: string) => {
        // Extract path from full URL
        const match = url.match(/hostel-images\/(.+)$/)
        return match ? match[1] : null
      })
      .filter((path: string | null): path is string => path !== null)
    
    if (paths.length === 0) {
      return {}
    }
    
    return deleteImages(paths)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Delete failed'
    }
  }
}
