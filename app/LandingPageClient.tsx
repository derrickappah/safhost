'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/Loader'
import { useAuth } from '@/components/AuthProvider'

interface LandingPageClientProps {
  children: React.ReactNode
}

export default function LandingPageClient({ children }: LandingPageClientProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  // Show loader while checking auth
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f7f6'
      }}>
        <Loader size="large" />
      </div>
    )
  }

  // Don't render content if authenticated (redirecting)
  if (isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f7f6'
      }}>
        <Loader size="large" />
      </div>
    )
  }

  return <>{children}</>
}
