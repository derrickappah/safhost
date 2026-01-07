'use client'

/**
 * Get user's current location using browser geolocation API
 */
export async function getCurrentLocation(): Promise<{
  latitude: number
  longitude: number
} | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser')
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        console.warn('Error getting location:', error.message)
        resolve(null)
      },
      {
        enableHighAccuracy: false, // Set to false for faster/more reliable response on slow networks
        timeout: 10000, // Increase to 10 seconds
        maximumAge: 300000, // Cache for 30 seconds
      }
    )
  })
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Calculate walking time from distance in kilometers
 * Average walking speed: 5 km/h
 * Returns time in minutes
 */
export function calculateWalkingTime(distanceKm: number): number {
  const walkingSpeedKmh = 5 // Average walking speed
  const timeHours = distanceKm / walkingSpeedKmh
  return Math.round(timeHours * 60) // Convert to minutes
}

/**
 * Calculate driving time from distance in kilometers
 * Average driving speed in city: 30 km/h
 * Returns time in minutes
 */
export function calculateDrivingTime(distanceKm: number): number {
  const drivingSpeedKmh = 30 // Average city driving speed
  const timeHours = distanceKm / drivingSpeedKmh
  return Math.round(timeHours * 60) // Convert to minutes
}

/**
 * Format time in minutes to a readable string
 */
export function formatTime(minutes: number): string {
  if (minutes < 1) {
    return '< 1 min'
  } else if (minutes < 60) {
    return `${minutes} min`
  } else {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (mins === 0) {
      return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`
    }
    return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ${mins} min`
  }
}
