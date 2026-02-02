'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  IoPerson,
  IoMailOutline,
  IoLockClosed,
  IoCallOutline,
  IoCheckmarkCircle,
  IoEyeOutline,
  IoEyeOffOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'
import { signUp } from '@/lib/auth/user'
import { getCurrentUser } from '@/lib/auth/client'
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
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [nameError, setNameError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Auth Guard: Redirect if already logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await getCurrentUser()
        if (data?.user) {
          router.replace(redirect)
        } else {
          setIsCheckingAuth(false)
        }
      } catch (err) {
        console.error('Auth guard error:', err)
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router, redirect])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    if (emailError) setEmailError('')
    if (error) setError('')
  }

  const handleInputChange = (setter: (val: string) => void, errorSetter?: (err: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value)
    if (error) setError('')
    if (errorSetter) errorSetter('')
  }

  const validatePhone = (phone: string) => {
    // Basic phone validation: digits plus optional + prefix
    return /^\+?[0-9]{10,15}$/.test(phone.replace(/\s/g, ''))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setEmailError('')

    // Validation
    if (!name || !email || !password || !confirmPassword || !phone) {
      setError('Please fill in all required fields')
      return
    }

    if (!isValidEmail(email)) {
      const emailErr = getEmailError(email)
      setEmailError(emailErr || 'Please enter a valid email address')
      return
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
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
        if (data.hasSession) {
          // Logged in immediately, go to school selection
          router.push(`/select-school?redirect=${encodeURIComponent(redirect)}`)
        } else {
          // No session - email confirmation likely required
          setIsSuccess(true)
          setNeedsConfirmation(true)
          setIsLoading(false)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Loader />
        </div>
      </div>
    )
  }

  if (isSuccess && needsConfirmation) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>Success</h1>
        </header>
        <div className={styles.scrollContent}>
          <div className={styles.hero}>
            <div className={styles.heroIcon} style={{ backgroundColor: '#f0fdf4' }}>
              <IoInformationCircleOutline size={32} color="#16a34a" />
            </div>
            <h2 className={styles.heroTitle}>Check Your Email</h2>
            <p className={styles.heroSubtitle}>
              We've sent a confirmation link to <strong>{email}</strong>.
              Please click the link to activate your account.
            </p>
          </div>
          <Link href={`/auth/login?redirect=${encodeURIComponent(redirect)}`} className={styles.submitButton}>
            Go to Login
          </Link>
        </div>
      </div>
    )
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
            <IoPerson size={20} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={handleInputChange(setName, setNameError)}
              onBlur={() => {
                if (name && name.length < 2) {
                  setNameError('Name is too short')
                }
              }}
              className={`${styles.input} ${nameError ? styles.inputError : ''}`}
              required
              disabled={isLoading}
            />
            {nameError && <div className={styles.fieldError}>{nameError}</div>}
          </div>

          <div className={styles.inputGroup}>
            <IoMailOutline size={20} className={styles.inputIcon} />
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
              disabled={isLoading}
            />
            {emailError && <div className={styles.fieldError}>{emailError}</div>}
          </div>

          <div className={styles.inputGroup}>
            <IoCallOutline size={20} className={styles.inputIcon} />
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={handleInputChange(setPhone, setPhoneError)}
              onBlur={() => {
                if (phone && !validatePhone(phone)) {
                  setPhoneError('Please enter a valid phone number')
                }
              }}
              className={`${styles.input} ${phoneError ? styles.inputError : ''}`}
              required
              disabled={isLoading}
            />
            {phoneError && <div className={styles.fieldError}>{phoneError}</div>}
          </div>

          <div className={styles.inputGroup}>
            <IoLockClosed size={20} className={styles.inputIcon} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={handleInputChange(setPassword)}
              className={styles.input}
              required
              minLength={6}
              disabled={isLoading}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          </div>

          <div className={styles.inputGroup}>
            <IoLockClosed size={20} className={styles.inputIcon} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={handleInputChange(setConfirmPassword)}
              className={styles.input}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

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
