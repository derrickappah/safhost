'use client'

import { useEffect } from 'react'
import { reportWebVitals, measurePageLoad } from '@/lib/analytics/performance'

export default function WebVitals() {
  useEffect(() => {
    // Measure page load performance
    measurePageLoad()

    // Report Web Vitals if available
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // LCP - Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          reportWebVitals({
            name: 'LCP',
            value: lastEntry.renderTime || lastEntry.loadTime,
            id: lastEntry.id,
            delta: lastEntry.renderTime || lastEntry.loadTime,
            entries: [lastEntry],
          })
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // FID - First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            reportWebVitals({
              name: 'FID',
              value: entry.processingStart - entry.startTime,
              id: entry.id,
              delta: entry.processingStart - entry.startTime,
              entries: [entry],
            })
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // CLS - Cumulative Layout Shift
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          reportWebVitals({
            name: 'CLS',
            value: clsValue,
            id: 'cls',
            delta: clsValue,
            entries: [],
          })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        // Cleanup
        return () => {
          lcpObserver.disconnect()
          fidObserver.disconnect()
          clsObserver.disconnect()
        }
      } catch (error) {
        console.error('Web Vitals measurement failed:', error)
      }
    }
  }, [])

  return null
}
