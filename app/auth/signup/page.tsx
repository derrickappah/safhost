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
import { isValidEmail, getEmailError, validatePhone, isInternalUrl } from '@/lib/validation'
import styles from '../page.module.css'
import Loader from '@/components/Loader'

function SignUpPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect')
  const redirect = isInternalUrl(redirectParam) ? redirectParam! : '/dashboard'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Auth Guard: Redirect if already logged in
  useEffect(() => {
    let isMounted = true
    async function checkAuth() {
      try {
        const { data } = await getCurrentUser()
        if (isMounted) {
          if (data?.user) {
            router.replace(redirect)
          } else {
            setIsCheckingAuth(false)
          }
        }
      } catch (err) {
        console.error('Auth guard error:', err)
        if (isMounted) setIsCheckingAuth(false)
      }
    }
    checkAuth()
    return () => { isMounted = false }
  }, [router, redirect])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleBlur = (field: string) => {
    const value = formData[field as keyof typeof formData]
    let fieldError = ''

    if (field === 'email' && value && !isValidEmail(value)) {
      fieldError = getEmailError(value) || 'Invalid email format'
    } else if (field === 'phone' && value && !validatePhone(value)) {
      fieldError = 'Please enter a valid phone number'
    } else if (field === 'name' && value && value.length < 2) {
      fieldError = 'Name is too short'
    } else if (field === 'confirmPassword' && value && value !== formData.password) {
      fieldError = 'Passwords do not match'
    }

    setFieldErrors(prev => ({ ...prev, [field]: fieldError }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const { name, email, phone, password, confirmPassword } = formData

    // Validation
    if (!name || !email || !password || !confirmPassword || !phone) {
      setError('Please fill in all required fields')
      return
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
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
              We've sent a confirmation link to <strong>{formData.email}</strong>.
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
              name="name"
              placeholder="Full name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={() => handleBlur('name')}
              className={`${styles.input} ${fieldErrors.name ? styles.inputError : ''}`}
              required
              disabled={isLoading}
            />
            {fieldErrors.name && <div className={styles.fieldError}>{fieldErrors.name}</div>}
          </div>

          <div className={styles.inputGroup}>
            <IoMailOutline size={20} className={styles.inputIcon} />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={() => handleBlur('email')}
              className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
              required
              disabled={isLoading}
            />
            {fieldErrors.email && <div className={styles.fieldError}>{fieldErrors.email}</div>}
          </div>

          <div className={styles.inputGroup}>
            <IoCallOutline size={20} className={styles.inputIcon} />
            <input
              type="tel"
              name="phone"
              placeholder="Phone number"
              value={formData.phone}
              onChange={handleInputChange}
              onBlur={() => handleBlur('phone')}
              className={`${styles.input} ${fieldErrors.phone ? styles.inputError : ''}`}
              required
              disabled={isLoading}
            />
            {fieldErrors.phone && <div className={styles.fieldError}>{fieldErrors.phone}</div>}
          </div>

          <div className={styles.inputGroup}>
            <IoLockClosed size={20} className={styles.inputIcon} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password (min. 6 characters)"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={() => handleBlur('password')}
              className={styles.input}
              required
              minLength={6}
              disabled={isLoading}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          </div>

          <div className={styles.inputGroup}>
            <IoLockClosed size={20} className={styles.inputIcon} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onBlur={() => handleBlur('confirmPassword')}
              className={`${styles.input} ${fieldErrors.confirmPassword ? styles.inputError : ''}`}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
            {fieldErrors.confirmPassword && <div className={styles.fieldError}>{fieldErrors.confirmPassword}</div>}
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
