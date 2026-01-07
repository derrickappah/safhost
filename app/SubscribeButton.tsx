'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { IoArrowForward } from 'react-icons/io5'
import styles from './page.module.css'
import { getCurrentUser } from '@/lib/auth/client'

export default function SubscribeButton() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // Check auth on mount
  useEffect(() => {
    getCurrentUser().then((result) => {
      setIsAuthenticated(!!result.data?.user)
    }).catch(() => {
      setIsAuthenticated(false)
    })
  }, [])

  const handleSubscribe = () => {
    if (isAuthenticated) {
      router.push('/subscribe')
    } else {
      router.push('/auth/signup?redirect=/subscribe')
    }
  }

  return (
    <button
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      <span className={styles.subscribeButtonText}>Subscribe Now</span>
      <IoArrowForward size={20} color="#fff" />
    </button>
  )
}
