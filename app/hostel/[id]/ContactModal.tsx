'use client'

import { useState } from 'react'
import { IoCall, IoLogoWhatsapp, IoChatbubbleOutline, IoCopyOutline, IoClose } from 'react-icons/io5'
import styles from './page.module.css'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  landlordName: string
  phone: string
}

export default function ContactModal({ isOpen, onClose, landlordName, phone }: ContactModalProps) {
  const [copiedPhone, setCopiedPhone] = useState(false)

  if (!isOpen) return null

  const handleCall = () => {
    window.location.href = `tel:${phone}`
  }

  const handleWhatsApp = () => {
    const phoneNumber = phone.replace(/[^\d+]/g, '')
    const whatsappNumber = phoneNumber.startsWith('+') ? phoneNumber : `+233${phoneNumber.replace(/^0/, '')}`
    window.open(`https://wa.me/${whatsappNumber}`, '_blank')
  }

  const handleSMS = () => {
    window.location.href = `sms:${phone}`
  }

  const handleCopyPhone = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    try {
      await navigator.clipboard.writeText(phone)
      setCopiedPhone(true)
      setTimeout(() => setCopiedPhone(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className={styles.contactModalOverlay} onClick={onClose}>
      <div className={styles.contactModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.contactModalHeader}>
          <h2 className={styles.contactModalTitle}>Contact Landlord</h2>
          <button
            className={styles.contactModalClose}
            onClick={onClose}
          >
            <IoClose size={24} />
          </button>
        </div>
        
        <div className={styles.contactModalContent}>
          <div className={styles.landlordInfo}>
            <h3 className={styles.landlordName}>{landlordName}</h3>
            <div className={styles.phoneNumber}>
              <IoCall size={18} color="#64748b" />
              <span>{phone}</span>
            </div>
          </div>

          <div className={styles.contactOptions}>
            <button
              className={styles.contactOption}
              onClick={handleCall}
            >
              <div className={styles.contactOptionIcon} style={{ backgroundColor: '#10b981' }}>
                <IoCall size={24} color="#fff" />
              </div>
              <div className={styles.contactOptionContent}>
                <h4 className={styles.contactOptionTitle}>Call</h4>
                <p className={styles.contactOptionDesc}>Make a phone call</p>
              </div>
            </button>

            <button
              className={styles.contactOption}
              onClick={handleWhatsApp}
            >
              <div className={styles.contactOptionIcon} style={{ backgroundColor: '#25D366' }}>
                <IoLogoWhatsapp size={24} color="#fff" />
              </div>
              <div className={styles.contactOptionContent}>
                <h4 className={styles.contactOptionTitle}>WhatsApp</h4>
                <p className={styles.contactOptionDesc}>Send a message</p>
              </div>
            </button>

            <button
              className={styles.contactOption}
              onClick={handleSMS}
            >
              <div className={styles.contactOptionIcon} style={{ backgroundColor: '#3b82f6' }}>
                <IoChatbubbleOutline size={24} color="#fff" />
              </div>
              <div className={styles.contactOptionContent}>
                <h4 className={styles.contactOptionTitle}>SMS</h4>
                <p className={styles.contactOptionDesc}>Send a text message</p>
              </div>
            </button>

            <button
              className={styles.contactOption}
              onClick={handleCopyPhone}
            >
              <div className={styles.contactOptionIcon} style={{ backgroundColor: '#64748b' }}>
                <IoCopyOutline size={24} color="#fff" />
              </div>
              <div className={styles.contactOptionContent}>
                <h4 className={styles.contactOptionTitle}>
                  {copiedPhone ? 'Copied!' : 'Copy Number'}
                </h4>
                <p className={styles.contactOptionDesc}>
                  {copiedPhone ? 'Phone number copied to clipboard' : 'Copy to clipboard'}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
