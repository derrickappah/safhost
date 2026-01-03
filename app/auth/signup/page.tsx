'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { IoArrowBack, IoPerson, IoMailOutline, IoLockClosed, IoCallOutline, IoCheckmarkCircle } from 'react-icons/io5'
import { signUp } from '@/lib/auth/user'
import styles from '../page.module.css'

function SignUpPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!name || !email || !password) {
      setError('Please fill in all required fields')
      return
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setIsLoading(true)
    
    try {
      const { data, error: signUpError } = await signUp({
        email,
        password,
        phone: phone || undefined,
        name
      })
      
      if (signUpError) {
        setError(signUpError)
        setIsLoading(false)
        return
      }
      
      if (data?.user) {
        // Redirect to the intended page or dashboard
        router.push(redirect)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => router.back()}
        >
          <IoArrowBack size={24} color="#1e293b" />
        </button>
        <h1 className={styles.headerTitle}>Sign Up</h1>
        <div style={{ width: '44px' }} />
      </header>

      <div className={styles.scrollContent}>
        <section className={styles.hero}>
          <div className={styles.heroIcon}>
            <IoPerson size={32} color="#2563eb" />
          </div>
          <h2 className={styles.heroTitle}>Create Account</h2>
          <p className={styles.heroSubtitle}>
            Sign up to access all hostel listings and features
          </p>
        </section>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <IoPerson
              size={20}
              className={styles.inputIcon}
            />
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <IoMailOutline
              size={20}
              className={styles.inputIcon}
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <IoCallOutline
              size={20}
              className={styles.inputIcon}
            />
            <input
              type="tel"
              placeholder="Phone number (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <IoLockClosed
              size={20}
              className={styles.inputIcon}
            />
            <input
              type="password"
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              'Creating Account...'
            ) : (
              <>
                <span>Create Account</span>
                <IoCheckmarkCircle size={20} color="#fff" />
              </>
            )}
          </button>
        </form>

        <div className={styles.switchText}>
          Already have an account?{' '}
          <Link href={`/auth/login?redirect=${encodeURIComponent(redirect)}`} className={styles.switchLink}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      </div>
    }>
      <SignUpPageContent />
    </Suspense>
  )
}
