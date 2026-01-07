'use client'

import MapHeader from './Header'
import { MapProvider } from './MapContext'

export default function MapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MapProvider>
      <MapHeader />
      {children}
    </MapProvider>
  )
}
