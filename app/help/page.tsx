'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoArrowBack, IoChevronDown, IoChevronUp } from 'react-icons/io5'
import styles from './page.module.css'

const faqs = [
  {
    question: 'How do I subscribe?',
    answer: 'Click the "Subscribe" button on the homepage or in your profile. Select a plan (Monthly or Semester), choose your payment method, and complete the payment via Paystack. Your subscription will be activated immediately after successful payment.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept Mobile Money (MTN MoMo, Vodafone Cash, AirtelTigo) and Bank Cards (Visa/Mastercard) through Paystack.',
  },
  {
    question: 'How long does my subscription last?',
    answer: 'Monthly subscriptions last for 30 days from the date of payment. Semester subscriptions last for 3 months. You will receive a reminder 3 days before your subscription expires.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer: 'Subscriptions are one-time purchases and do not auto-renew. You simply need to wait for your subscription to expire. If you need a refund, please contact support.',
  },
  {
    question: 'How do I find hostels near my school?',
    answer: 'Select your school during signup or in your profile settings. The app will automatically show hostels assigned to your school. You can also use the map view to see hostels visually.',
  },
  {
    question: 'Can I save hostels for later?',
    answer: 'Yes! Click the heart icon on any hostel listing to save it to your favorites. You can access all your saved hostels from the Favorites tab.',
  },
  {
    question: 'How do I contact a landlord?',
    answer: 'Once you have an active subscription, click the "Contact Landlord" button on any hostel detail page. This will reveal the landlord\'s phone number and email.',
  },
  {
    question: 'Can I leave reviews?',
    answer: 'Yes! Any student with an active subscription can leave reviews and ratings for hostels. You can edit or delete your reviews anytime from the hostel detail page.',
  },
  {
    question: 'What if I find incorrect information?',
    answer: 'You can report any hostel or review by clicking the "Report" button. Our admin team will review and take appropriate action.',
  },
  {
    question: 'How do I use promo codes?',
    answer: 'Enter your promo code in the promo code field on the subscription page. The discount will be applied automatically before payment.',
  },
]

export default function HelpPage() {
  const router = useRouter()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span>{faq.question}</span>
                  {openIndex === index ? (
                    <IoChevronUp size={20} color="#64748b" />
                  ) : (
                    <IoChevronDown size={20} color="#64748b" />
                  )}
                </button>
                {openIndex === index && (
                  <div className={styles.faqAnswer}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact Support</h2>
          <div className={styles.contactOptions}>
            <a href="mailto:support@hostelfinder.com" className={styles.contactOption}>
              <span className={styles.contactLabel}>Email</span>
              <span className={styles.contactValue}>support@hostelfinder.com</span>
            </a>
            <a href="tel:+233123456789" className={styles.contactOption}>
              <span className={styles.contactLabel}>Phone</span>
              <span className={styles.contactValue}>+233 123 456 789</span>
            </a>
            <button
              className={styles.contactOption}
              onClick={() => router.push('/support')}
            >
              <span className={styles.contactLabel}>Live Chat</span>
              <span className={styles.contactValue}>Available 24/7</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
