'use server'

import { createClient } from '../supabase/server'
import { logAuditAction } from './audit'

interface HostelRow {
  name: string
  school_id?: string
  school_name?: string
  price_min: number
  price_max?: number
  address: string
  hostel_manager_name: string
  hostel_manager_phone: string
  latitude?: number
  longitude?: number
  distance?: number
  amenities?: string
  description?: string
  gender_restriction?: 'male' | 'female' | 'mixed'
  is_available?: boolean
}

/**
 * Parse CSV file
 */
async function parseCSV(file: File): Promise<HostelRow[]> {
  const text = await file.text()
  const lines = text.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  
  const rows: HostelRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    // Map common column names
    const mappedRow: HostelRow = {
      name: row.name || row.hostel_name || '',
      school_id: row.school_id || '',
      school_name: row.school_name || row.school || '',
      price_min: Number(row.price_min || row.price || 0),
      price_max: row.price_max ? Number(row.price_max) : undefined,
      address: row.address || row.location || '',
      hostel_manager_name: row.hostel_manager_name || row.hostel_manager || row.landlord_name || row.landlord || '',
      hostel_manager_phone: row.hostel_manager_phone || row.manager_phone || row.landlord_phone || row.phone || '',
      latitude: row.latitude ? Number(row.latitude) : undefined,
      longitude: row.longitude ? Number(row.longitude) : undefined,
      distance: row.distance ? Number(row.distance) : undefined,
      amenities: row.amenities ? row.amenities.split(';').map((a: string) => a.trim()) : [],
      description: row.description || '',
      gender_restriction: row.gender_restriction || undefined,
      is_available: row.is_available !== undefined ? row.is_available === 'true' : true,
    }
    
    if (mappedRow.name) {
      rows.push(mappedRow)
    }
  }
  
  return rows
}

/**
 * Check for duplicates
 */
async function checkDuplicates(hostel: HostelRow): Promise<string | null> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('hostels')
    .select('id, name')
    .ilike('name', hostel.name)
    .ilike('address', hostel.address)
    .limit(1)
    .maybeSingle()
  
  return data?.id || null
}

/**
 * Bulk upload hostels from CSV/Excel file
 */
export async function bulkUploadHostels(file: File): Promise<{
  data: { success: number; errors: string[] } | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const { getUser } = await import('../auth')
    const user = await getUser()
    
    if (!user) {
      return { data: null, error: 'Authentication required' }
    }
    
    // Parse file
    let rows: HostelRow[]
    if (file.name.endsWith('.csv')) {
      rows = await parseCSV(file)
    } else {
      return { data: null, error: 'Only CSV files are supported at this time' }
    }
    
    const errors: string[] = []
    let successCount = 0
    const duplicates: string[] = []
    
    // Process each row
    for (const row of rows) {
      try {
        // Validate required fields
        if (!row.name || !row.address || !row.hostel_manager_name || !row.hostel_manager_phone || !row.price_min) {
          errors.push(`Row "${row.name || 'Unknown'}": Missing required fields`)
          continue
        }
        
        // Check for school
        let schoolId = row.school_id
        if (!schoolId && row.school_name) {
          const { data: school } = await supabase
            .from('schools')
            .select('id')
            .ilike('name', row.school_name)
            .single()
          
          if (school) {
            schoolId = school.id
          } else {
            errors.push(`Row "${row.name}": School "${row.school_name}" not found`)
            continue
          }
        }
        
        if (!schoolId) {
          errors.push(`Row "${row.name}": School ID or name required`)
          continue
        }
        
        // Check for duplicates
        const duplicateId = await checkDuplicates(row)
        if (duplicateId) {
          duplicates.push(row.name)
          // Skip duplicates for now (could update instead)
          continue
        }
        
        // Insert hostel
        const { error: insertError } = await supabase
          .from('hostels')
          .insert({
            school_id: schoolId,
            name: row.name,
            description: row.description || null,
            price_min: row.price_min,
            price_max: row.price_max || null,
            address: row.address,
            hostel_manager_name: row.hostel_manager_name,
            hostel_manager_phone: row.hostel_manager_phone,
            latitude: row.latitude || null,
            longitude: row.longitude || null,
            distance: row.distance || null,
            amenities: Array.isArray(row.amenities) ? row.amenities : [],
            gender_restriction: row.gender_restriction || null,
            is_available: row.is_available !== undefined ? row.is_available : true,
          })
        
        if (insertError) {
          errors.push(`Row "${row.name}": ${insertError.message}`)
        } else {
          successCount++
        }
      } catch (error) {
        errors.push(`Row "${row.name}": ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    // Log audit action
    const { logAuditAction } = await import('./audit')
    await logAuditAction('bulk_upload_hostels', 'hostels', '', {
      file_name: file.name,
      total_rows: rows.length,
      success_count: successCount,
      error_count: errors.length,
      duplicates: duplicates.length,
    })
    
    if (duplicates.length > 0) {
      errors.push(`${duplicates.length} duplicate(s) skipped: ${duplicates.slice(0, 5).join(', ')}${duplicates.length > 5 ? '...' : ''}`)
    }
    
    return {
      data: {
        success: successCount,
        errors,
      },
      error: null,
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to upload hostels',
    }
  }
}
