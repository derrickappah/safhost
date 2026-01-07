'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface CompareContextType {
  activeCount: number
  setActiveCount: (count: number) => void
}

const CompareContext = createContext<CompareContextType | undefined>(undefined)

export function CompareProvider({ children }: { children: ReactNode }) {
  const [activeCount, setActiveCount] = useState(0)
  return (
    <CompareContext.Provider value={{ activeCount, setActiveCount }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider')
  }
  return context
}
