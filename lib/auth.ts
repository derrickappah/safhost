// Server-side functions (use dynamic imports to avoid bundling in client)
export async function getSession() {
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const startTime = Date.now()

  // Fetch fresh user from Supabase per-request
  // This ensures session isolation and prevents identity swapping
  const apiStart = Date.now()
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const apiTime = Date.now() - apiStart

  const totalTime = Date.now() - startTime
  if (process.env.NODE_ENV === 'development') {
    console.log(`[getUser] API call took ${apiTime}ms, total ${totalTime}ms`)
  }

  return user
}

// Re-export auth functions
export { signUp, signIn, signOut } from './auth/user'
export { getCurrentUser, getCurrentSession } from './auth/client'
export { checkSubscriptionAccess, getSubscriptionFromCookies, setSubscriptionCookies, clearSubscriptionCookies } from './auth/subscription'
export { checkAccess, isAdmin, requireAdmin as requireAdminAccess } from './auth/middleware'
