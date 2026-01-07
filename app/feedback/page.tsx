'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoArrowBack, IoCheckmarkCircle } from 'react-icons/io5'
import styles from './page.module.css'
import { getCurrentUser } from '@/lib/auth/client'
import { createClient } from '@/lib/supabase/client'

export default function FeedbackPage() {
  const router = useRouter()
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'improvement' | 'other'>('bug')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    
    setSubmitting(true)
    const supabase = createClient()
    const { data: userData } = await getCurrentUser()
    const { getActiveSubscription } = await import('@/lib/actions/subscriptions')
    const { data: subscription } = await getActiveSubscription()
    
    const feedbackData: any = {
      feedback_type: feedbackType,
      subject: subject || null,
      message: message,
    }

    if (userData?.user?.id) {
      feedbackData.user_id = userData.user.id
      feedbackData.subscription_id = null
    } else if (subscription?.id) {
      feedbackData.subscription_id = subscription.id
      feedbackData.user_id = null
    } else {
      alert('Authentication or subscription required to submit feedback')
      setSubmitting(false)
      return
    }

    const { error } = await supabase
      .from('feedback')
      .insert(feedbackData)
    
    if (error) {
      alert('Failed to submit feedback: ' + error.message)
      setSubmitting(false)
      return
    }
    
    setSubmitted(true)
    setSubmitting(false)
    setTimeout(() => {
      setSubject('')
      setMessage('')
      setSubmitted(false)
    }, 3000)
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Share Your Feedback</h2>
          <p className={styles.sectionDescription}>
            Help us improve HostelFinder by sharing your thoughts, reporting bugs, or suggesting new features.
          </p>

          {submitted && (
            <div className={styles.successMessage}>
              <IoCheckmarkCircle size={24} color="#22c55e" />
              <div>
                <h3>Thank you!</h3>
                <p>Your feedback has been submitted successfully.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Feedback Type *</label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value as any)}
                className={styles.select}
                required
              >
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="improvement">Improvement Suggestion</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Subject (Optional)</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your feedback"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Message *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please provide details about your feedback..."
                rows={6}
                className={styles.textarea}
                required
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={!message.trim() || submitting || submitted}
            >
              {submitting ? 'Submitting...' : submitted ? 'Submitted!' : 'Submit Feedback'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
