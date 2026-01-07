'use client'

import ContactedHeader from './Header'
import { FilterProvider } from './FilterContext'

export default function ContactedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FilterProvider>
      <ContactedHeader />
      {children}
    </FilterProvider>
  )
}
