'use client'

import styles from './Loader.module.css'

interface LoaderProps {
  className?: string
  size?: 'small' | 'medium' | 'large'
}

export default function Loader({ className, size = 'medium' }: LoaderProps) {
  return (
    <div className={`${styles.loader} ${styles[size]} ${className || ''}`} aria-label="Loading" />
  )
}
