'use client'

import { useMemo, useCallback } from 'react'
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api'
import { IoLocation, IoStar, IoCall } from 'react-icons/io5'
import type { Hostel } from '@/lib/actions/hostels'

const libraries: ('places')[] = ['places']

interface MapViewProps {
  hostels: Hostel[]
  center?: { lat: number; lng: number }
  zoom?: number
  onHostelClick?: (hostel: Hostel) => void
  selectedHostelId?: string | null
}

export default function MapView({
  hostels,
  center = { lat: 5.6037, lng: -0.1870 }, // Default to Accra, Ghana
  zoom = 13,
  onHostelClick,
  selectedHostelId,
}: MapViewProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  })

  const mapCenter = useMemo(() => center, [center])

  const handleMarkerClick = useCallback(
    (hostel: Hostel) => {
      if (onHostelClick) {
        onHostelClick(hostel)
      }
    },
    [onHostelClick]
  )

  if (!isLoaded) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f1f5f9',
        }}
      >
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <p>Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={mapCenter}
      zoom={zoom}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
    >
      {hostels
        .filter((hostel) => hostel.latitude && hostel.longitude)
        .map((hostel) => (
          <Marker
            key={hostel.id}
            position={{
              lat: hostel.latitude!,
              lng: hostel.longitude!,
            }}
            onClick={() => handleMarkerClick(hostel)}
            icon={{
              url: selectedHostelId === hostel.id
                ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#2563eb" stroke="#fff" stroke-width="2"/>
                    <circle cx="20" cy="20" r="8" fill="#fff"/>
                  </svg>
                `)
                : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="14" fill="#ef4444" stroke="#fff" stroke-width="2"/>
                    <circle cx="16" cy="16" r="6" fill="#fff"/>
                  </svg>
                `),
              scaledSize: new google.maps.Size(selectedHostelId === hostel.id ? 40 : 32, selectedHostelId === hostel.id ? 40 : 32),
            }}
          >
            {selectedHostelId === hostel.id && (
              <InfoWindow
                position={{
                  lat: hostel.latitude!,
                  lng: hostel.longitude!,
                }}
                onCloseClick={() => {
                  if (onHostelClick) {
                    onHostelClick(hostel)
                  }
                }}
              >
                <div style={{ padding: '8px', minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                    {hostel.name}
                  </h3>
                  <div style={{ marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <IoStar size={14} color="#fbbf24" />
                      <span>{Number(hostel.rating).toFixed(1)}</span>
                      <span>({hostel.review_count})</span>
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <strong style={{ color: '#059669' }}>GHS {hostel.price_min}</strong>/mo
                    </div>
                  </div>
                  {hostel.address && (
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>
                      {hostel.address}
                    </p>
                  )}
                  <button
                    onClick={() => {
                      window.location.href = `/hostel/${hostel.id}`
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    View Details
                  </button>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
    </GoogleMap>
  )
}
