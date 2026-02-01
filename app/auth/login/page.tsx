'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { IoMailOutline, IoLockClosed, IoArrowForward } from 'react-icons/io5'
import { signIn } from '@/lib/auth/user'
import { getProfile } from '@/lib/actions/profile'
import { isValidEmail, getEmailError } from '@/lib/validation'
import styles from '../page.module.css'
import Loader from '@/components/Loader'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)

    // Clear errors when user starts typing
    if (emailError) setEmailError('')
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setEmailError('')

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    // Validate email format
    if (!isValidEmail(email)) {
      const emailErr = getEmailError(email)
      setEmailError(emailErr || 'Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      const { data, error: signInError } = await signIn({
        email,
        password
      })

      if (signInError) {
        setError(signInError)
        setIsLoading(false)
        return
      }

      if (data?.user) {
        // Check if user has selected a school
        const { data: profile, error: profileError } = await getProfile()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          // Determine if we should block or proceed with defaults. 
          // Safest is to let them in but maybe show a toast or fallback?
          // Since the issue was about redirection logic, let's play safe:
          // If we can't get profile, we can't verify school logic.
          // We can fallback to dashboard or select-school. 
          // Let's assume safely that if profile fetch fails, we might need setup.
          // OR, since this is a critical flow, we could just redirect to dashboard
          // and let the dashboard handle missing profile data.
          // For now, let's NOT block login, but we should handle the 'undefined' school_id check.
        }

        // If user doesn't have a school_id, redirect to select school
        if (!profile?.school_id) {
          router.push('/select-school')
          return
        }

        // Redirect to the intended page or dashboard
        router.push(redirect)
        // Keep loading true while redirecting
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Log In</h1>
      </header>

      <div className={styles.scrollContent}>
        <section className={styles.hero}>
          <div className={styles.heroIcon}>
            <IoMailOutline size={32} color="#2563eb" />
          </div>
          <h2 className={styles.heroTitle}>Welcome Back</h2>
          <p className={styles.heroSubtitle}>
            Log in to continue accessing hostel listings
          </p>
        </section>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <IoMailOutline
              size={20}
              className={styles.inputIcon}
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => {
                if (email && !isValidEmail(email)) {
                  setEmailError(getEmailError(email) || 'Invalid email format')
                }
              }}
              className={`${styles.input} ${emailError ? styles.inputError : ''}`}
              required
            />
            {emailError && (
              <div className={styles.fieldError}>
                {emailError}
              </div>
            )}
          </div>

          <div className={styles.inputGroup}>
            <IoLockClosed
              size={20}
              className={styles.inputIcon}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
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
              'Logging in...'
            ) : (
              <>
                <span>Log In</span>
                <IoArrowForward size={20} color="#fff" />
              </>
            )}
          </button>
        </form>

        <div className={styles.switchText}>
          Don't have an account?{' '}
          <Link href={`/auth/signup?redirect=${encodeURIComponent(redirect)}`} className={styles.switchLink}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Loader />
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
