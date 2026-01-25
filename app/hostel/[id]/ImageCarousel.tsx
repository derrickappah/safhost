'use client'

import { useState } from 'react'
import Image from 'next/image'
import { IoArrowBack, IoShareOutline, IoHeart, IoHeartOutline } from 'react-icons/io5'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

interface ImageCarouselProps {
  images: string[]
  hostelName: string
  isFavorited: boolean
  onToggleFavorite: () => void
  onShare: () => void
}

export default function ImageCarousel({
  images,
  hostelName,
  isFavorited,
  onToggleFavorite,
  onShare
}: ImageCarouselProps) {
  const router = useRouter()
  const [currentImage, setCurrentImage] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && images.length > 0) {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }
    if (isRightSwipe && images.length > 0) {
      setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  return (
    <div className={styles.imageContainer}>
      <div
        className={styles.imageCarousel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {images.map((image, index) => (
          <Image
            key={index}
            src={image}
            alt={`${hostelName} ${index + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
            className={styles.hostelImage}
            style={{ display: currentImage === index ? 'block' : 'none' }}
            priority={index === 0}
            quality={index === 0 ? 90 : 85}
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>

      {/* Image Indicators */}
      {images.length > 1 && (
        <div className={styles.imageIndicators}>
          {images.map((_, index) => (
            <div
              key={index}
              className={`${styles.indicator} ${currentImage === index ? styles.indicatorActive : ''}`}
            />
          ))}
        </div>
      )}

      {/* Back Button */}
      <header className={styles.headerOverlay}>
        <button
          className={styles.backButton}
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <IoArrowBack size={22} color="#ffffff" />
        </button>
        <div className={styles.headerActions}>
          <button
            className={styles.actionButton}
            onClick={onShare}
            aria-label="Share hostel"
          >
            <IoShareOutline size={20} color="#ffffff" />
          </button>
          <button
            className={styles.actionButton}
            onClick={onToggleFavorite}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorited ? (
              <IoHeart size={20} color="#ef4444" />
            ) : (
              <IoHeartOutline size={20} color="#ffffff" />
            )}
          </button>
        </div>
      </header>
    </div>
  )
}
