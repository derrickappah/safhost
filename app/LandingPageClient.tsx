'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface LandingPageClientProps {
  children: React.ReactNode
}

export default function LandingPageClient({ children }: LandingPageClientProps) {
  const router = useRouter()

  useEffect(() => {
    // Check authentication on client side
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        router.replace('/dashboard')
      }
    }

    checkAuth()
  }, [router])

  return <>{children}</>
}
