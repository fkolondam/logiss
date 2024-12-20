import { faker } from '@faker-js/faker'
import {
  formatDate,
  parseDate,
  ensureQ4Date,
  getQ4DateRange,
  getWorkingDaysInRange,
} from './dateUtils'
import { getRandomCoordinates, generateInvoiceNumber, generateProofImageUrl } from './randomUtils'
import { generateBranchData } from './branchData'

const PAYMENT_METHODS = ['TUNAI', 'KREDIT']

// Get random status based on probabilities
const getRandomStatus = (isEndOfMonth) => {
  const random = Math.random()
  let cumulativeProbability = 0

  const probabilities = isEndOfMonth
    ? {
        'DITERIMA - SEMUA': 0.5,
        'DITERIMA - SEBAGIAN': 0.3,
        'BATAL - TOKO TUTUP': 0.1,
        'BATAL - TOKO TIDAK DAPAT DIAKSES': 0.1,
        'BATAL - TIDAK ADA UANG': 0.0,
        'BATAL - SALAH ORDER': 0.0,
        'KIRIM ULANG': 0.0,
      }
    : {
        'DITERIMA - SEMUA': 0.4,
        'DITERIMA - SEBAGIAN': 0.2,
        'BATAL - TOKO TUTUP': 0.1,
        'BATAL - TOKO TIDAK DAPAT DIAKSES': 0.1,
        'BATAL - TIDAK ADA UANG': 0.1,
        'BATAL - SALAH ORDER': 0.0,
        'KIRIM ULANG': 0.1,
      }

  for (const [status, probability] of Object.entries(probabilities)) {
    cumulativeProbability += probability
    if (random <= cumulativeProbability) {
      return status
    }
  }

  return 'DITERIMA - SEMUA' // fallback
}

// Amount ranges (adjust for end of month)
const getAmountRange = (isEndOfMonth, deliveryCount, vehicleActivity) => {
  const baseMin = isEndOfMonth ? 1000000 : 50000
  const baseMax = isEndOfMonth ? 10000000 : 5000000
  const activityMultiplier = Math.min(2.0, (deliveryCount + vehicleActivity) / 15) // Scale based on combined activity

  return {
    min: Math.floor(baseMin * activityMultiplier),
    max: Math.floor(baseMax * activityMultiplier),
  }
}

export function generateDeliveries(count, vehicleSchedule) {
  // Get branch data
  const { branches } = generateBranchData()
  const { start: q4Start, end: q4End } = getQ4DateRange()

  // Generate deliveries based on vehicle schedule
  let deliveryId = 14900
  const allDeliveries = []

  // Calculate total deliveries per vehicle for activity correlation
  const vehicleActivity = new Map()
  for (const [plateNumber, schedule] of vehicleSchedule.entries()) {
    const totalDeliveries = Array.from(schedule.dailyDeliveries.values()).reduce(
      (sum, count) => sum + count,
      0,
    )
    vehicleActivity.set(plateNumber, totalDeliveries)
  }

  // Get all working days in Q4 2024
  const workingDays = getWorkingDaysInRange(q4Start, q4End)

  // For each vehicle
  for (const [plateNumber, schedule] of vehicleSchedule.entries()) {
    const { vehicle } = schedule
    const branchName = vehicle.assignedDriver.branch
    const branchData = branches.find((b) => b.name === branchName)

    if (!branchData) {
      console.warn(`Branch not found for vehicle ${plateNumber}`)
      continue
    }

    // For each day in schedule
    for (const [dateStr, deliveryCount] of schedule.dailyDeliveries.entries()) {
      // Parse date string back to Date object and ensure it's in Q4 2024
      const date = ensureQ4Date(parseDate(dateStr))

      // Skip if not a working day
      if (!workingDays.some((d) => d.getTime() === date.getTime())) {
        continue
      }

      // Ensure date is within Q4 2024
      if (date < q4Start || date > q4End) {
        continue
      }

      // Check if it's end of month
      const monthDays = workingDays
        .filter((d) => d.getUTCMonth() === date.getUTCMonth())
        .sort((a, b) => a - b)
      const isEndOfMonth = monthDays.slice(-3).some((d) => d.getTime() === date.getTime())

      const amountRange = getAmountRange(
        isEndOfMonth,
        deliveryCount,
        vehicleActivity.get(plateNumber),
      )

      // Generate deliveries for this vehicle on this day
      for (let i = 0; i < deliveryCount; i++) {
        // Get random time ensuring even distribution throughout the day
        const timeSlot = 9 * (i / deliveryCount) // 9 hours (8 AM - 5 PM)
        const hour = Math.floor(timeSlot) + 8 // Start from 8 AM
        const minute = Math.floor((timeSlot % 1) * 60)
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`

        // Generate coordinates within branch radius
        const coordinates = getRandomCoordinates(
          branchData.lat,
          branchData.lng,
          branchData.radius || 5, // Default radius of 5km if not specified
        )

        // Generate invoice number
        const invoice = generateInvoiceNumber(branchName, date, deliveryId)

        // Generate amount based on end of month status and vehicle activity
        const baseAmount = faker.number.int(amountRange)
        const activityMultiplier = isEndOfMonth ? 1.5 : 1.0
        const vehicleActivityFactor = Math.min(2.0, vehicleActivity.get(plateNumber) / 100) // Scale based on total vehicle activity
        const amount = Math.floor(baseAmount * activityMultiplier * vehicleActivityFactor)

        // Generate status based on probabilities
        const status = getRandomStatus(isEndOfMonth)

        // Generate proof image URL
        const proofImage = generateProofImageUrl(branchName, invoice)

        allDeliveries.push({
          branch: branchName,
          driver: vehicle.assignedDriver.name,
          helper: faker.helpers.arrayElement(
            branchData.drivers.filter((d) => d !== vehicle.assignedDriver.name),
          ),
          vehicleNumber: plateNumber,
          date: formatDate(date), // Format date in MM/DD/YYYY format
          time,
          customer: faker.company.name().toUpperCase(),
          location: faker.location.street().toUpperCase(),
          invoice,
          amount,
          status,
          proofImage,
          id: deliveryId++,
          coordinates,
          paymentMethod: faker.helpers.arrayElement(PAYMENT_METHODS),
        })
      }
    }
  }

  // Sort by date and time
  return allDeliveries.sort((a, b) => {
    const dateA = parseDate(a.date)
    const dateB = parseDate(b.date)
    const dateCompare = dateA - dateB
    if (dateCompare !== 0) return dateCompare
    return a.time.localeCompare(b.time)
  })
}
