'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface MapContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
  showList: boolean
  setShowList: (show: boolean) => void
  showSearch: boolean
  setShowSearch: (show: boolean) => void
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export function MapProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showList, setShowList] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  
  return (
    <MapContext.Provider value={{ 
      searchQuery, 
      setSearchQuery, 
      showList, 
      setShowList,
      showSearch,
      setShowSearch
    }}>
      {children}
    </MapContext.Provider>
  )
}

export function useMap() {
  const context = useContext(MapContext)
  if (!context) {
    throw new Error('useMap must be used within MapProvider')
  }
  return context
}
