'use client'

import ViewedHeader from './Header'
import { FilterProvider } from './FilterContext'

export default function ViewedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FilterProvider>
      <ViewedHeader />
      {children}
    </FilterProvider>
  )
}
