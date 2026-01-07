'use client'

import { useMemo, useCallback, useState, useEffect, useRef } from 'react'
import { GoogleMap, MarkerF, useJsApiLoader, DirectionsService, DirectionsRenderer, InfoWindow, OverlayViewF } from '@react-google-maps/api'
import { IoLocation, IoStar, IoCall, IoWalk, IoCar, IoNavigate } from 'react-icons/io5'
import { motion, AnimatePresence } from 'framer-motion'
import type { Hostel } from '@/lib/actions/hostels'
import type { School } from '@/lib/actions/schools'
import { getCurrentLocation } from '@/lib/location/detect'
import { trackDirectionRequest } from '@/lib/actions/directions'

// SVG Helper Functions
const getSchoolIcon = (color = '#10b981') => {
  if (typeof google === 'undefined') return undefined
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 5L5 12V15H35V12L20 5Z" fill="${color}"/>
        <path d="M7 17V30H10V17H7Z" fill="${color}"/>
        <path d="M13 17V30H16V17H13Z" fill="${color}"/>
        <path d="M19 17V30H22V17H19Z" fill="${color}"/>
        <path d="M25 17V30H28V17H25Z" fill="${color}"/>
        <path d="M31 17V30H34V17H31Z" fill="${color}"/>
        <path d="M5 32V35H35V32H5Z" fill="${color}"/>
        <circle cx="20" cy="11" r="2" fill="white"/>
      </svg>
    `),
    scaledSize: new google.maps.Size(40, 40),
    anchor: new google.maps.Point(20, 40),
  } as google.maps.Icon
}

const getUserIcon = (color = '#3b82f6') => {
  if (typeof google === 'undefined') return undefined
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4L28 28L16 22L4 28L16 4Z" fill="${color}" stroke="white" stroke-width="2"/>
      </svg>
    `),
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 16),
  } as google.maps.Icon
}

const getHostelIcon = (imageUrl: string | null, isSelected: boolean) => {
  if (typeof google === 'undefined') return {}
  const size = isSelected ? 50 : 40
  const color = isSelected ? '#2563eb' : '#ef4444'
  
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="${size}" height="${size + 12}" viewBox="0 0 ${size} ${size + 12}" xmlns="http://www.w3.org/2000/svg">
        <path d="M${size/2} ${size + 12} L${size/2 - 8} ${size - 2} A${size/2} ${size/2} 0 1 1 ${size/2 + 8} ${size - 2} Z" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 4}" fill="white"/>
      </svg>
    `),
    scaledSize: new google.maps.Size(size, size + 12),
    anchor: new google.maps.Point(size/2, size + 12),
  }
}

const libraries: ('places')[] = ['places']

interface MapViewProps {
  hostels: Hostel[]
  center?: { lat: number; lng: number }
  zoom?: number
  onHostelClick?: (hostel: Hostel) => void
  onZoomChange?: (zoom: number) => void
  onCenterChange?: (center: { lat: number; lng: number }) => void
  onExitDirections?: () => void
  selectedHostelId?: string | null
  directionsMode?: boolean
  destinationSchool?: School | null
}

export default function MapView({
  hostels,
  center = { lat: 5.6037, lng: -0.1870 }, // Default to Accra, Ghana
  zoom = 13,
  onHostelClick,
  onZoomChange,
  onCenterChange,
  onExitDirections,
  selectedHostelId,
  directionsMode = false,
  destinationSchool = null,
}: MapViewProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null)
  const [travelMode, setTravelMode] = useState<google.maps.TravelMode>(
    typeof window !== 'undefined' && window.google ? google.maps.TravelMode.WALKING : 'WALKING' as any
  )
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hoveredHostelId, setHoveredHostelId] = useState<string | null>(null)
  const [hoveredSchoolId, setHoveredSchoolId] = useState<string | null>(null)
  const [isDirectionsMinimized, setIsDirectionsMinimized] = useState(false)
  const [minimizedPosition, setMinimizedPosition] = useState({ x: 0, y: 0 })
  const [isUserInteracting, setIsUserInteracting] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  
  // Refs to track last reported state to prevent circular loops
  const lastReportedZoom = useRef<number | null>(null)
  const lastReportedCenter = useRef<{ lat: number; lng: number } | null>(null)

  // Get all unique schools from hostels
  const schoolMarkers = useMemo(() => {
    if (directionsMode) return []
    
    const uniqueSchools = new Map<string, any>()
    hostels.forEach(hostel => {
      const school = hostel.school as any
      // Exclude destinationSchool if it's already shown as a specific marker
      if (school && school.id && !uniqueSchools.has(school.id) && school.id !== destinationSchool?.id) {
        if (school.latitude && school.longitude) {
          uniqueSchools.set(school.id, school)
        }
      }
    })
    return Array.from(uniqueSchools.values())
  }, [hostels, directionsMode, destinationSchool])

  const mapOptions = useMemo(() => {
    const options: google.maps.MapOptions = {
      disableDefaultUI: false,
      zoomControl: true,
      zoomControlOptions: {
        position: typeof window !== 'undefined' && window.google ? google.maps.ControlPosition.RIGHT_BOTTOM : 9
      },
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: typeof window !== 'undefined' && window.google ? google.maps.ControlPosition.RIGHT_BOTTOM : 9
      },
      gestureHandling: 'greedy', 
      scrollwheel: true,
      draggable: true,
      clickableIcons: false,
    }
    
    // Add map ID if configured
    if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID) {
      options.mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID
    } else {
      // Only apply styles if mapId is NOT present
      options.styles = [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ]
    }
    
    return options
  }, [isLoaded])

  const selectedHostel = hostels.find(h => h.id === selectedHostelId)
  const canShowDirections = !!(directionsMode && selectedHostel && destinationSchool && 
    selectedHostel.latitude && selectedHostel.longitude && 
    destinationSchool.latitude && destinationSchool.longitude)

  const directionsOptions = useMemo(() => {
    if (!canShowDirections) return null
    return {
      destination: { lat: destinationSchool!.latitude!, lng: destinationSchool!.longitude! },
      origin: { lat: selectedHostel!.latitude!, lng: selectedHostel!.longitude! },
      travelMode: travelMode,
    }
  }, [canShowDirections, destinationSchool, selectedHostel, travelMode])

  useEffect(() => {
    if (!canShowDirections) {
      setDirectionsResponse(null)
    }
  }, [canShowDirections])

  // Fit bounds when directions are received
  useEffect(() => {
    if (directionsResponse && map) {
      const bounds = directionsResponse.routes[0].bounds
      if (bounds) {
        map.fitBounds(bounds)
      }
    }
  }, [directionsResponse, map])

  useEffect(() => {
    if (isLoaded) {
      getCurrentLocation().then(location => {
        if (location) {
          setUserLocation({ lat: location.latitude, lng: location.longitude })
        }
      })
    }
  }, [isLoaded])

  useEffect(() => {
    if (canShowDirections) {
      trackDirectionRequest(selectedHostelId!, destinationSchool!.id, travelMode)
    }
  }, [canShowDirections, selectedHostelId, destinationSchool, travelMode])

  const directionsCallback = useCallback((result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
    if (result !== null) {
      if (status === 'OK') {
        setDirectionsResponse(result)
        setError(null)
      } else if (status === 'REQUEST_DENIED') {
        console.error('Directions request failed:', status)
        setError('Directions API is not enabled. Please enable it in the Google Cloud Console.')
      } else {
        console.error('Directions request failed:', status)
        setError('Could not find a route.')
      }
    }
  }, [])

  const handleMarkerClick = useCallback(
    (hostel: Hostel) => {
      if (onHostelClick) {
        onHostelClick(hostel)
      }
    },
    [onHostelClick]
  )

  const openExternalMaps = () => {
    if (!selectedHostelId || !destinationSchool) return
    
    const hostel = hostels.find(h => h.id === selectedHostelId)
    if (!hostel || !hostel.latitude || !hostel.longitude) return
    
    const destLat = destinationSchool.latitude
    const destLng = destinationSchool.longitude
    if (!destLat || !destLng) return

    const url = `https://www.google.com/maps/dir/?api=1&origin=${hostel.latitude},${hostel.longitude}&destination=${destLat},${destLng}&travelmode=${travelMode.toLowerCase()}`
    window.open(url, '_blank')
  }

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
    <div ref={mapContainerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={isUserInteracting ? undefined : center}
        zoom={isUserInteracting ? undefined : zoom}
        options={mapOptions}
        onLoad={setMap}
        onUnmount={() => setMap(null)}
        onDragStart={() => setIsUserInteracting(true)}
        onDragEnd={() => setIsUserInteracting(false)}
        onZoomChanged={() => {
          if (map && onZoomChange) {
            const newZoom = map.getZoom()
            if (typeof newZoom === 'number' && newZoom !== lastReportedZoom.current) {
              lastReportedZoom.current = newZoom
              onZoomChange(newZoom)
            }
          }
        }}
        onCenterChanged={() => {
          if (map && onCenterChange) {
            const newCenter = map.getCenter()
            if (newCenter) {
              const newLat = newCenter.lat()
              const newLng = newCenter.lng()
              
              const isDifferent = !lastReportedCenter.current || 
                Math.abs(newLat - lastReportedCenter.current.lat) > 0.0001 || 
                Math.abs(newLng - lastReportedCenter.current.lng) > 0.0001

              if (isDifferent) {
                const centerObj = { lat: newLat, lng: newLng }
                lastReportedCenter.current = centerObj
                onCenterChange(centerObj)
              }
            }
          }
        }}
      >
        {/* Directions */}
        {canShowDirections && directionsOptions && (
          <>
            <DirectionsService
              options={directionsOptions}
              callback={directionsCallback}
            />
            {directionsResponse && (
              <DirectionsRenderer
                options={{
                  directions: directionsResponse,
                  suppressMarkers: true, // We'll show our own markers
                  preserveViewport: true, // Allow user to zoom/pan after initial fit
                  polylineOptions: {
                    strokeColor: '#2563eb',
                    strokeWeight: 5,
                    strokeOpacity: 0.8,
                  }
                }}
              />
            )}
          </>
        )}

        {/* Hostel Markers */}
        {hostels
          .filter((hostel) => {
            const lat = Number(hostel.latitude)
            const lng = Number(hostel.longitude)
            return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
          })
          .map((hostel) => {
            const isSelected = selectedHostelId === hostel.id
            const isHovered = hoveredHostelId === hostel.id
            const size = isSelected ? 62 : 56 // Adjusting for scale
            const innerSize = size - 12 // Account for padding and border
            
            return (
              <OverlayViewF
                key={hostel.id}
                position={{
                  lat: Number(hostel.latitude),
                  lng: Number(hostel.longitude),
                }}
                mapPaneName="overlayMouseTarget"
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: isSelected ? 1.1 : 1, 
                    opacity: 1,
                  }}
                  whileHover={{ 
                    scale: 1.05,
                  }}
                  onClick={() => handleMarkerClick(hostel)}
                  onMouseEnter={() => setHoveredHostelId(hostel.id)}
                  onMouseLeave={() => setHoveredHostelId(null)}
                  style={{
                    position: 'absolute',
                    transform: 'translate(-50%, -50%)',
                    width: '44px',
                    height: '44px',
                    backgroundColor: '#000000',
                    borderRadius: '10px',
                    border: `${isSelected ? '2px' : '1.5px'} solid ${isSelected ? '#14B8A6' : '#FFFFFF'}`,
                    padding: '2px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'visible',
                    boxShadow: isHovered ? '0 0 0 3px rgba(255,255,255,0.15)' : '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    zIndex: isSelected ? 100 : (isHovered ? 50 : 1),
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '7px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {hostel.images?.[0] ? (
                      <img 
                        src={hostel.images[0]} 
                        alt={hostel.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#111111',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <IoLocation color="#ffffff" size={24} />
                      </div>
                    )}
                    {/* Optional dark overlay */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      pointerEvents: 'none'
                    }} />

                    {/* Rating Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(4px)',
                      color: '#fbbf24', // Amber/Yellow
                      padding: '1px 4px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontSize: '9px',
                      fontWeight: 800,
                      zIndex: 2,
                      border: '0.5px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <IoStar size={8} />
                      <span>{Number(hostel.rating).toFixed(1)}</span>
                    </div>
                  </div>
                </motion.div>
              </OverlayViewF>
            )
          })}

        {/* School Marker */}
        {destinationSchool && destinationSchool.latitude && destinationSchool.longitude && (
          <OverlayViewF
            position={{
              lat: destinationSchool.latitude,
              lng: destinationSchool.longitude,
            }}
            mapPaneName="overlayMouseTarget"
          >
            <div
              style={{
                position: 'absolute',
                transform: 'translate(-50%, -100%)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
              onMouseEnter={() => setHoveredSchoolId(destinationSchool.id)}
              onMouseLeave={() => setHoveredSchoolId(null)}
              onClick={() => {
                // Filter hostels by this school (this logic is usually handled by the parent page via state/params)
                if (onHostelClick) {
                  // In directions mode, clicking the school could show relevant info
                  console.log('School clicked:', destinationSchool.name)
                }
              }}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: Math.max(0.5, Math.min(1.5, (zoom || 13) / 13)), 
                  opacity: 1 
                }}
                transition={{ type: 'spring', damping: 12, stiffness: 150 }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* School Name Label on Hover */}
                <AnimatePresence>
                  {hoveredSchoolId === destinationSchool.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      style={{
                        position: 'absolute',
                        bottom: '100%',
                        marginBottom: '8px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        whiteSpace: 'nowrap',
                        fontSize: '12px',
                        fontWeight: 700,
                        zIndex: 20,
                      }}
                    >
                      {destinationSchool.name}
                    </motion.div>
                  )}
                </AnimatePresence>

                {destinationSchool.logo_url ? (
                  <img 
                    src={destinationSchool.logo_url} 
                    alt={destinationSchool.name}
                    style={{
                      width: '48px',
                      height: '48px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                    }}
                  />
                ) : (
                  <div style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 5L5 12V15H35V12L20 5Z" fill="#10b981"/>
                      <path d="M7 17V30H10V17H7Z" fill="#10b981"/>
                      <path d="M13 17V30H16V17H13Z" fill="#10b981"/>
                      <path d="M19 17V30H22V17H19Z" fill="#10b981"/>
                      <path d="M25 17V30H28V17H25Z" fill="#10b981"/>
                      <path d="M31 17V30H34V17H31Z" fill="#10b981"/>
                      <path d="M5 32V35H35V32H5Z" fill="#10b981"/>
                      <circle cx="20" cy="11" r="2" fill="white"/>
                    </svg>
                  </div>
                )}
              </motion.div>
            </div>
          </OverlayViewF>
        )}

        {/* User Location Marker */}
        {userLocation && (
          <MarkerF
            position={userLocation}
            icon={getUserIcon()}
          />
        )}

        {/* Global School Markers (outside directions mode) */}
        {!directionsMode && schoolMarkers.map((school) => (
          <OverlayViewF
            key={school.id}
            position={{
              lat: school.latitude!,
              lng: school.longitude!,
            }}
            mapPaneName="overlayMouseTarget"
          >
            <div
              style={{
                position: 'absolute',
                transform: 'translate(-50%, -100%)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
              onMouseEnter={() => setHoveredSchoolId(school.id)}
              onMouseLeave={() => setHoveredSchoolId(null)}
              onClick={() => {
                // If there's a specific filter action needed, call it here
                if (onHostelClick) {
                   console.log('Global school marker clicked:', school.name)
                }
              }}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: Math.max(0.5, Math.min(1.5, (zoom || 13) / 13)), 
                  opacity: 1 
                }}
                transition={{ type: 'spring', damping: 12, stiffness: 150 }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* School Name Label on Hover */}
                <AnimatePresence>
                  {hoveredSchoolId === school.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      style={{
                        position: 'absolute',
                        bottom: '100%',
                        marginBottom: '8px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        whiteSpace: 'nowrap',
                        fontSize: '12px',
                        fontWeight: 700,
                        zIndex: 20,
                      }}
                    >
                      {school.name}
                    </motion.div>
                  )}
                </AnimatePresence>

                {school.logo_url ? (
                  <img 
                    src={school.logo_url} 
                    alt={school.name}
                    style={{
                      width: '42px',
                      height: '42px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                    }}
                  />
                ) : (
                  <div style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                    <svg width="36" height="36" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 5L5 12V15H35V12L20 5Z" fill="#10b981"/>
                      <path d="M7 17V30H10V17H7Z" fill="#10b981"/>
                      <path d="M13 17V30H16V17H13Z" fill="#10b981"/>
                      <path d="M19 17V30H22V17H19Z" fill="#10b981"/>
                      <path d="M25 17V30H28V17H25Z" fill="#10b981"/>
                      <path d="M31 17V30H34V17H31Z" fill="#10b981"/>
                      <path d="M5 32V35H35V32H5Z" fill="#10b981"/>
                      <circle cx="20" cy="11" r="2" fill="white"/>
                    </svg>
                  </div>
                )}
              </motion.div>
            </div>
          </OverlayViewF>
        ))}
      </GoogleMap>

      {/* Directions Controls Overlay */}
      <AnimatePresence>
        {directionsMode && (
          isDirectionsMinimized ? (
            <motion.div
              layoutId="directions-panel"
              drag
              dragConstraints={mapContainerRef}
              dragElastic={0.1}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                setMinimizedPosition(prev => ({
                  x: prev.x + info.offset.x,
                  y: prev.y + info.offset.y
                }))
              }}
              initial={{ x: minimizedPosition.x, y: minimizedPosition.y }}
              animate={{ x: minimizedPosition.x, y: minimizedPosition.y }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, cursor: 'grabbing' }}
              onClick={() => setIsDirectionsMinimized(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '56px',
                height: '56px',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(10px)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                cursor: 'grab',
                zIndex: 1000,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                touchAction: 'none'
              }}
            >
              <IoNavigate size={28} color="#2563eb" />
            </motion.div>
          ) : (
            <motion.div
              layoutId="directions-panel"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              style={{
                position: 'absolute',
                top: '16px',
                left: 0,
                right: 0,
                marginLeft: 'auto',
                marginRight: 'auto',
                backgroundColor: 'white',
                padding: '12px',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                width: 'min(90%, 350px)',
                zIndex: 110,
                pointerEvents: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Directions</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setIsDirectionsMinimized(true)}
                    style={{ background: '#f1f5f9', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', color: '#64748b', fontSize: '12px', fontWeight: 600 }}
                  >
                    Minimize
                  </button>
                  <button 
                    onClick={onExitDirections}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#ef4444', fontSize: '12px', fontWeight: 600 }}
                  >
                    Exit
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setTravelMode(google.maps.TravelMode.WALKING)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: travelMode === google.maps.TravelMode.WALKING ? '#2563eb' : '#e2e8f0',
                    backgroundColor: travelMode === google.maps.TravelMode.WALKING ? '#eff6ff' : 'white',
                    color: travelMode === google.maps.TravelMode.WALKING ? '#2563eb' : '#64748b',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <IoWalk size={18} />
                  Walk
                </button>
                <button
                  onClick={() => setTravelMode(google.maps.TravelMode.DRIVING)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: travelMode === google.maps.TravelMode.DRIVING ? '#2563eb' : '#e2e8f0',
                    backgroundColor: travelMode === google.maps.TravelMode.DRIVING ? '#eff6ff' : 'white',
                    color: travelMode === google.maps.TravelMode.DRIVING ? '#2563eb' : '#64748b',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <IoCar size={18} />
                  Drive
                </button>
              </div>

              {directionsResponse && (
                <div style={{ fontSize: '13px', color: '#475569' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Distance:</span>
                    <span style={{ fontWeight: 600 }}>{directionsResponse.routes[0].legs[0].distance?.text}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Estimated Time:</span>
                    <span style={{ fontWeight: 600 }}>{directionsResponse.routes[0].legs[0].duration?.text}</span>
                  </div>
                  <button
                    onClick={openExternalMaps}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#1e293b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <IoNavigate size={16} />
                    Open in External Maps
                  </button>
                </div>
              )}

              {error && (
                <div style={{ fontSize: '12px', color: '#ef4444', textAlign: 'center' }}>
                  {error}
                </div>
              )}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  )
}
