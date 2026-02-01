'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function SearchBar() {
    const [searchQuery, setSearchQuery] = useState('')
    const router = useRouter()

    const handleSearch = (e: FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            // Navigate to hostels page with search query
            router.push(`/hostels?search=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    return (
        <form onSubmit={handleSearch} className={styles.searchBar}>
            <div className={styles.searchIcon}>
                <span className="material-icons-round">search</span>
            </div>
            <input
                type="text"
                placeholder="Search by school name..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search for hostels by school name"
            />
            <button type="submit" className={styles.searchActionButton}>
                Search
            </button>
        </form>
    )
}
