// Utility functions for generating random data

// Generate random number between min and max (inclusive)
export const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Generate random amount within a range
export const getRandomAmount = (min, max) => {
  // Round to nearest 100 for more realistic amounts
  const amount = Math.floor(Math.random() * (max - min + 1) + min)
  return Math.round(amount / 100) * 100
}

// Get random item from array
export const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)]
}

// Get random status based on probability distribution
export const getRandomStatus = (statusConfig) => {
  const random = Math.random()
  let cumulativeProbability = 0

  for (const [status, probability] of Object.entries(statusConfig)) {
    cumulativeProbability += probability
    if (random <= cumulativeProbability) {
      return status
    }
  }

  // Fallback to first status if something goes wrong
  return Object.keys(statusConfig)[0]
}

// Generate random coordinates within a radius of a center point
export const getRandomCoordinates = (centerLat, centerLng, radiusInKm) => {
  // Earth's radius in kilometers
  const R = 6371

  // Convert radius from kilometers to radians
  const radiusInRad = radiusInKm / R

  // Generate random angle
  const randomAngle = Math.random() * 2 * Math.PI

  // Generate random radius within the given radius
  const randomRadius = Math.random() * radiusInRad

  // Calculate new coordinates
  const lat = Math.asin(
    Math.sin((centerLat * Math.PI) / 180) * Math.cos(randomRadius) +
      Math.cos((centerLat * Math.PI) / 180) * Math.sin(randomRadius) * Math.cos(randomAngle),
  )

  const lng =
    (centerLng * Math.PI) / 180 +
    Math.atan2(
      Math.sin(randomAngle) * Math.sin(randomRadius) * Math.cos((centerLat * Math.PI) / 180),
      Math.cos(randomRadius) - Math.sin((centerLat * Math.PI) / 180) * Math.sin(lat),
    )

  // Convert back to degrees
  return {
    lat: (lat * 180) / Math.PI,
    lng: (lng * 180) / Math.PI,
  }
}

// Generate random invoice number based on branch and date
export const generateInvoiceNumber = (branch, date, index) => {
  const branchCodes = {
    'RDA SUMEDANG': '241110',
    'RDA SUKABUMI': 'SIL241109',
    'RDA JEMBER': 'STP/JBR-AABD-',
    'RDA CIANJUR': 'SIL241106',
    'RDA GORONTALO': 'SI241103',
    'RDA MANADO': 'AABD',
    'RDA GRESIK': 'STP/GRS-AABD-',
  }

  const baseNumber = branchCodes[branch] || 'INV'
  const sequence = String(index + 400).padStart(3, '0')

  return baseNumber + sequence
}

// Generate proof image URL based on branch and invoice
export const generateProofImageUrl = (branch, invoice) => {
  // Simulate consistent but random-looking image IDs
  const hash = Array.from(branch + invoice).reduce(
    (hash, char) => (hash << 5) - hash + char.charCodeAt(0),
    0,
  )
  const imageId = Math.abs(hash).toString(16).slice(0, 12)

  return 'https://drive.google.com/file/d/' + imageId + '/view?usp=drivesdk'
}

// Get fuel level based on time of day and base level
export const getFuelLevel = (baseLevel, time) => {
  const hour = parseInt(time.split(':')[0])

  // Decrease fuel level as the day progresses
  if (hour < 10) return baseLevel
  if (hour < 13) return Math.max(baseLevel - 20, 15)
  if (hour < 16) return Math.max(baseLevel - 40, 15)
  return Math.max(baseLevel - 60, 15)
}

// Get random time in working hours (8 AM - 5 PM)
export const getRandomTimeInWorkingHours = () => {
  const hours = Math.floor(Math.random() * 9) + 8 // 8 AM - 5 PM
  const minutes = Math.floor(Math.random() * 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}
