'use client'

import { useState } from 'react'
import { IoChevronDown, IoHelpCircleOutline } from 'react-icons/io5'
import styles from './page.module.css'

interface FaqItem {
  question: string
  answer: string
}

const FAQS: FaqItem[] = [
  {
    question: 'How do I know the hostels on SafHost are real and scam-free?',
    answer:
      'Every hostel listed on SafHost undergoes in-person physical verification by our campus teams. We inspect room conditions, confirm running water, backup power, and security protocols, and verify the authorized management. No random street agents or middlemen.',
  },
  {
    question: 'Do I have to pay viewing or inspection fees?',
    answer:
      'Never. SafHost is built to eliminate predatory agent viewing fees. You can browse verified photos, compare prices, read student reviews, and view distances to campus completely free.',
  },
  {
    question: 'How do I reserve or pay for a room?',
    answer:
      'Once you find a hostel you like, you can view the official hostel management contact details, arrange an in-person walk-in or virtual confirmation, and book directly with the hostel’s official administration.',
  },
  {
    question: 'Can I find hostels closest to my lecture halls?',
    answer:
      'Yes! You can search by your specific institution (UG Legon, KNUST, UPSA, UCC, ATU, etc.) and filter by walking distance to ensure you never have to worry about long commutes.',
  },
  {
    question: 'Are prices on SafHost negotiable or fixed?',
    answer:
      'Prices displayed are the official seasonal/semester rates set directly by hostel administrations. We display transparent rates with zero inflated broker markups.',
  },
]

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className={styles.faqList}>
      {FAQS.map((faq, index) => {
        const isOpen = openIndex === index
        return (
          <div
            key={index}
            className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}
          >
            <button
              type="button"
              className={styles.faqQuestion}
              onClick={() => toggleFaq(index)}
              aria-expanded={isOpen}
            >
              <span className={styles.faqQuestionText}>
                <IoHelpCircleOutline className={styles.faqIcon} size={20} />
                {faq.question}
              </span>
              <IoChevronDown
                className={`${styles.faqChevron} ${isOpen ? styles.faqChevronOpen : ''}`}
                size={20}
              />
            </button>
            {isOpen && (
              <div className={styles.faqAnswer}>
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
