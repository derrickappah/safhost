import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getCachedAdminStatus, setCachedAdminStatus } from './lib/cache/admin'
import { getCachedSubscription } from './lib/cache/subscription'

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  const currentPath = request.nextUrl.pathname
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Use getSession() for faster cookie-based checks (no network call)
  // Only use getUser() when we actually need validated user data (admin routes)
  const sessionStart = Date.now()
  const { data: { session } } = await supabase.auth.getSession()
  const sessionTime = Date.now() - sessionStart
  const user = session?.user || null
  
  if (process.env.NODE_ENV === 'development' && sessionTime > 100) {
    console.log(`[Middleware] getSession took ${sessionTime}ms for ${currentPath}`)
  }

  // Routes that require authentication only (no subscription)
  const authOnlyRoutes = ['/subscribe', '/profile']
  
  if (authOnlyRoutes.includes(currentPath)) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', currentPath)
      return NextResponse.redirect(url)
    }
    // User is authenticated, allow through
    return supabaseResponse
  }

  // Routes that require active subscription
  const subscriptionRoutes = [
    '/hostels',
    '/hostel',
    '/dashboard',
    '/favorites',
    '/viewed',
    '/contacted',
    '/compare'
  ]

  // Check if current path requires subscription
  const requiresSubscription = subscriptionRoutes.some(route => 
    currentPath === route || currentPath.startsWith(`${route}/`)
  )

  if (requiresSubscription) {
    // First check authentication
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', currentPath)
      return NextResponse.redirect(url)
    }

    // Check subscription status (use cache for performance)
    const cachedSubscription = await getCachedSubscription(user.id)
    let hasSubscription = false

    if (cachedSubscription !== null) {
      // Use cached value - check if it's a valid subscription object
      if (cachedSubscription && typeof cachedSubscription === 'object' && cachedSubscription.status === 'active') {
        // Also check expiration if subscription exists
        // NULL expires_at is treated as expired/invalid for security
        const now = new Date()
        const expiresAt = cachedSubscription.expires_at ? new Date(cachedSubscription.expires_at) : null
        hasSubscription = expiresAt !== null && expiresAt > now
      } else {
        // Cached null means no subscription
        hasSubscription = false
      }
    } else {
      // Cache miss - check database
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('id, status, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)

      if (subscriptions && subscriptions.length > 0) {
        const subscription = subscriptions[0]
        // Check if subscription is not expired
        // NULL expires_at is treated as expired/invalid for security
        const now = new Date()
        const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null
        hasSubscription = expiresAt !== null && expiresAt > now
      }
    }

    if (!hasSubscription) {
      const url = request.nextUrl.clone()
      url.pathname = '/subscribe'
      url.searchParams.set('redirect', currentPath)
      return NextResponse.redirect(url)
    }
  }

  // Protect admin routes - need validated user for admin check
  if (currentPath.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    
    // Check cache first
    const cachedAdminStatus = await getCachedAdminStatus(user.id)
    if (cachedAdminStatus !== null) {
      if (!cachedAdminStatus) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
      // User is admin, allow access
    } else {
      // Not in cache, check database
      let isAdmin = false
      
      // Check profiles table first - user can read their own profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (!error && profile?.role === 'admin') {
        isAdmin = true
      } else if (user.user_metadata?.role === 'admin') {
        // Fallback to user_metadata if profile check fails
        isAdmin = true
      }
      
      // Cache the result
      await setCachedAdminStatus(user.id, isAdmin)
      
      if (!isAdmin) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    }
  }

  const totalTime = Date.now() - startTime
  if (process.env.NODE_ENV === 'development' && totalTime > 200) {
    console.warn(`[Middleware] Slow middleware execution: ${totalTime}ms for ${currentPath}`)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Run middleware on protected routes
     * Includes subscription-protected routes (hostels, dashboard, etc.)
     */
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/favorites/:path*',
    '/subscribe/:path*',
    '/viewed/:path*',
    '/contacted/:path*',
    '/notifications/:path*',
    '/compare/:path*',
    '/feedback/:path*',
    '/support/:path*',
    '/help/:path*',
    '/hostels/:path*',
    '/hostel/:path*',
  ],
}
