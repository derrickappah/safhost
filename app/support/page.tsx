'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoArrowBack, IoMailOutline, IoCallOutline, IoChatbubbleOutline, IoSend } from 'react-icons/io5'
import styles from './page.module.css'
import { getCurrentUser } from '@/lib/auth/client'
import { createClient } from '@/lib/supabase/client'

export default function SupportPage() {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSendMessage = async () => {
    if (!message.trim()) return
    
    setSending(true)
    const supabase = createClient()
    const { data: userData } = await getCurrentUser()
    
    // In a real app, this would send to a support system
    // For now, we'll just show a success message
    setTimeout(() => {
      setSent(true)
      setSending(false)
      setMessage('')
      setTimeout(() => setSent(false), 3000)
    }, 1000)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <IoArrowBack size={24} color="#1e293b" />
        </button>
        <h1 className={styles.headerTitle}>Support</h1>
        <div style={{ width: '40px' }} />
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact Us</h2>
          <p className={styles.sectionDescription}>
            Get in touch with our support team. We're here to help!
          </p>

          <div className={styles.contactMethods}>
            <a href="mailto:support@hostelfinder.com" className={styles.contactCard}>
              <div className={styles.contactIcon} style={{ backgroundColor: '#fee2e2' }}>
                <IoMailOutline size={24} color="#dc2626" />
              </div>
              <div className={styles.contactInfo}>
                <h3 className={styles.contactTitle}>Email</h3>
                <p className={styles.contactValue}>support@hostelfinder.com</p>
                <span className={styles.contactHint}>We'll respond within 24 hours</span>
              </div>
            </a>

            <a href="tel:+233123456789" className={styles.contactCard}>
              <div className={styles.contactIcon} style={{ backgroundColor: '#dcfce7' }}>
                <IoCallOutline size={24} color="#16a34a" />
              </div>
              <div className={styles.contactInfo}>
                <h3 className={styles.contactTitle}>Phone</h3>
                <p className={styles.contactValue}>+233 123 456 789</p>
                <span className={styles.contactHint}>Mon-Fri, 9AM-5PM GMT</span>
              </div>
            </a>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Send a Message</h2>
          <div className={styles.chatContainer}>
            <div className={styles.chatMessages}>
              <div className={styles.chatMessage}>
                <div className={styles.chatIcon}>
                  <IoChatbubbleOutline size={20} color="#2563eb" />
                </div>
                <div className={styles.chatBubble}>
                  <p>Hello! How can we help you today?</p>
                </div>
              </div>
            </div>
            {sent && (
              <div className={styles.successMessage}>
                Message sent! We'll get back to you soon.
              </div>
            )}
            <div className={styles.chatInput}>
              <textarea
                className={styles.messageInput}
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
              <button
                className={styles.sendButton}
                onClick={handleSendMessage}
                disabled={!message.trim() || sending}
              >
                <IoSend size={20} color="#fff" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
