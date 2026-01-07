// Server-side functions (use dynamic imports to avoid bundling in client)
export async function getSession() {
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const startTime = Date.now()
  
  // Check cache first to avoid redundant API calls
  const { getCachedUser, setCachedUser } = await import('./cache/user')
  const cacheStart = Date.now()
  const cachedUser = await getCachedUser()
  const cacheTime = Date.now() - cacheStart
  
  if (cachedUser !== null) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[getUser] Cache hit in ${cacheTime}ms`)
    }
    return cachedUser
  }
  
  // Cache miss - fetch from Supabase
  const apiStart = Date.now()
  const { createClient } = await import('./supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const apiTime = Date.now() - apiStart
  
  // Cache the result (even if null, to avoid repeated calls)
  await setCachedUser(user)
  
  const totalTime = Date.now() - startTime
  if (process.env.NODE_ENV === 'development') {
    console.log(`[getUser] Cache miss - API call took ${apiTime}ms, total ${totalTime}ms`)
  }
  
  return user
}

// Re-export auth functions
export { signUp, signIn, signOut } from './auth/user'
export { getCurrentUser, getCurrentSession } from './auth/client'
export { checkSubscriptionAccess, getSubscriptionFromCookies, setSubscriptionCookies, clearSubscriptionCookies } from './auth/subscription'
export { checkAccess, isAdmin, requireAdmin as requireAdminAccess } from './auth/middleware'
