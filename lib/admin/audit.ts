'use server'

import { createClient } from '../supabase/server'
import { getUser } from '../auth'

/**
 * Log an admin action to the audit trail
 */
export async function logAuditAction(
  actionType: string,
  resourceType: string,
  resourceId: string | null,
  details: Record<string, any>
): Promise<{
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    
    if (!user) {
      return { error: 'Authentication required' }
    }
    
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        action_type: actionType,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
      })
    
    if (error) {
      console.error('Failed to log audit action:', error)
      return { error: error.message }
    }
    
    return { error: null }
  } catch (error) {
    console.error('Audit logging error:', error)
    return { error: error instanceof Error ? error.message : 'Failed to log action' }
  }
}

/**
 * Get audit logs
 */
export async function getAuditLogs(limit: number = 100): Promise<{
  data: any[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        admin:users(email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: data || [], error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch audit logs',
    }
  }
}
