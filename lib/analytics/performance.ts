/**
 * Performance monitoring utilities
 * Tracks Core Web Vitals and other performance metrics
 */

export interface WebVitals {
  name: string
  value: number
  id: string
  delta: number
  entries: PerformanceEntry[]
}

/**
 * Report Web Vitals to analytics
 * Can be extended to send to analytics service (e.g., Vercel Analytics, Google Analytics)
 */
export function reportWebVitals(metric: WebVitals) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric.name, metric.value)
  }

  // In production, send to analytics service
  // Example: send to Vercel Analytics
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID) {
    // You can integrate with Vercel Analytics or other services here
    // Example:
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   body: JSON.stringify(metric),
    // })
  }
}

/**
 * Measure page load performance
 */
export function measurePageLoad() {
  if (typeof window === 'undefined') return

  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (navigation) {
      const metrics = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        request: navigation.responseStart - navigation.requestStart,
        response: navigation.responseEnd - navigation.responseStart,
        dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        load: navigation.loadEventEnd - navigation.loadEventStart,
        total: navigation.loadEventEnd - navigation.fetchStart,
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[Performance] Page Load Metrics:', metrics)
      }
    }
  })
}

/**
 * Measure API response times
 */
export function measureAPIResponse(url: string, startTime: number) {
  const duration = Date.now() - startTime
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] API ${url}: ${duration}ms`)
  }

  // Log slow API calls
  if (duration > 1000) {
    console.warn(`[Performance] Slow API call: ${url} took ${duration}ms`)
  }
}
