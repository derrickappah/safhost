'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import styles from './page.module.css'

export default function BottomBar() {
    const { isAuthenticated, isLoading } = useAuth()

    // Don't show bottom bar for authenticated users or while loading
    if (isLoading || isAuthenticated) {
        return null
    }

    return (
        <div className={styles.bottomBar}>
            <div className={styles.bottomBarContent}>
                <div>
                    <p className={styles.bottomBarTitle}>Ready to find a home?</p>
                    <p className={styles.bottomBarSubtitle}>Join 10k+ students today</p>
                </div>
                <Link href="/auth/signup" className={styles.bottomBarCta}>
                    Create Account
                </Link>
            </div>
        </div>
    )
}
