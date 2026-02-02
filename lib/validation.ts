/**
 * Validates an email address using a comprehensive regex pattern
 * @param email - The email address to validate
 * @returns true if the email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  // RFC 5322 compliant email regex (simplified but comprehensive)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Additional checks for common email format issues
  if (email.length > 254) return false // Max email length
  if (email.startsWith('@') || email.endsWith('@')) return false
  if (email.includes('..')) return false // No consecutive dots
  if (email.startsWith('.') || email.endsWith('.')) return false

  return emailRegex.test(email.trim())
}

/**
 * Gets a user-friendly error message for email validation
 * @param email - The email address to validate
 * @returns Error message if invalid, null if valid
 */
export function getEmailError(email: string): string | null {
  if (!email) {
    return 'Email address is required'
  }

  if (!email.includes('@')) {
    return 'Email must contain @ symbol'
  }

  if (!email.includes('.')) {
    return 'Email must contain a domain (e.g., .com)'
  }

  if (email.startsWith('@') || email.endsWith('@')) {
    return 'Email format is invalid'
  }

  if (email.includes('..')) {
    return 'Email cannot contain consecutive dots'
  }

  if (!isValidEmail(email)) {
    return 'Please enter a valid email address (e.g., user@example.com)'
  }

  return null
}
/**
 * Validates a phone number
 * @param phone - The phone number to validate
 * @returns true if the phone is valid, false otherwise
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false
  // Basic phone validation: digits plus optional + prefix, length 10-15
  return /^\+?[0-9]{10,15}$/.test(phone.replace(/\s/g, ''))
}

/**
 * Validates if a URL is an internal path to prevent open redirect vulnerabilities
 * @param url - The URL/path to validate
 * @returns true if it's an internal path, false otherwise
 */
export function isInternalUrl(url: string | null): boolean {
  if (!url) return false
  // Must start with / and not // (which could be protocol-relative)
  return url.startsWith('/') && !url.startsWith('//')
}
