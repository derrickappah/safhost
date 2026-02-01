'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { IoPerson, IoMailOutline, IoLockClosed, IoCallOutline, IoCheckmarkCircle } from 'react-icons/io5'
import { signUp } from '@/lib/auth/user'
import { getProfile } from '@/lib/actions/profile'
import { isValidEmail, getEmailError } from '@/lib/validation'
import styles from '../page.module.css'
import Loader from '@/components/Loader'

function SignUpPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
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
    if (!name || !email || !password || !phone) {
      setError('Please fill in all required fields')
      return
    }

    // Validate email format
    if (!isValidEmail(email)) {
      const emailErr = getEmailError(email)
      setEmailError(emailErr || 'Please enter a valid email address')
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
        phone,
        name
      })

      if (signUpError) {
        setError(signUpError)
        setIsLoading(false)
        return
      }

      if (data?.user) {
        // New users should always select a school first
        router.push('/select-school')
        // Keep loading true while redirecting
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Sign Up</h1>
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
            <IoCallOutline
              size={20}
              className={styles.inputIcon}
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.input}
              required
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
        <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Loader />
        </div>
      </div>
    }>
      <SignUpPageContent />
    </Suspense>
  )
}
