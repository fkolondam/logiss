import { faker } from '@faker-js/faker'
import {
  formatDate,
  parseDate,
  ensureQ4Date,
  getQ4DateRange,
  getWorkingDaysInRange,
  startOfMonth,
  endOfMonth,
} from './dateUtils'
import { getRandomCoordinates, generateInvoiceNumber, generateProofImageUrl } from './randomUtils'
import { generateBranchData } from './branchData'

const PAYMENT_METHODS = ['TUNAI', 'KREDIT']

// Status probabilities with weights for different scenarios
const STATUS_PROBABILITIES = {
  END_OF_MONTH: {
    'DITERIMA - SEMUA': 0.5,
    'DITERIMA - SEBAGIAN': 0.3,
    'BATAL - TOKO TUTUP': 0.1,
    'BATAL - TOKO TIDAK DAPAT DIAKSES': 0.1,
    'BATAL - TIDAK ADA UANG': 0.0,
    'BATAL - SALAH ORDER': 0.0,
    'KIRIM ULANG': 0.0,
  },
  NORMAL: {
    'DITERIMA - SEMUA': 0.4,
    'DITERIMA - SEBAGIAN': 0.2,
    'BATAL - TOKO TUTUP': 0.1,
    'BATAL - TOKO TIDAK DAPAT DIAKSES': 0.1,
    'BATAL - TIDAK ADA UANG': 0.1,
    'BATAL - SALAH ORDER': 0.0,
    'KIRIM ULANG': 0.1,
  },
  HIGH_ACTIVITY: {
    'DITERIMA - SEMUA': 0.6,
    'DITERIMA - SEBAGIAN': 0.2,
    'BATAL - TOKO TUTUP': 0.05,
    'BATAL - TOKO TIDAK DAPAT DIAKSES': 0.05,
    'BATAL - TIDAK ADA UANG': 0.05,
    'BATAL - SALAH ORDER': 0.0,
    'KIRIM ULANG': 0.05,
  },
}

// Get random status based on probabilities and activity level
const getRandomStatus = (isEndOfMonth, activityLevel) => {
  const random = Math.random()
  let cumulativeProbability = 0

  // Choose probability set based on conditions
  let probabilities
  if (isEndOfMonth) {
    probabilities = STATUS_PROBABILITIES.END_OF_MONTH
  } else if (activityLevel > 0.7) {
    probabilities = STATUS_PROBABILITIES.HIGH_ACTIVITY
  } else {
    probabilities = STATUS_PROBABILITIES.NORMAL
  }

  for (const [status, probability] of Object.entries(probabilities)) {
    cumulativeProbability += probability
    if (random <= cumulativeProbability) {
      return status
    }
  }

  return 'DITERIMA - SEMUA' // fallback
}

// Amount ranges with activity-based adjustments
const getAmountRange = (isEndOfMonth, deliveryCount, vehicleActivity) => {
  const baseMin = isEndOfMonth ? 1000000 : 50000
  const baseMax = isEndOfMonth ? 10000000 : 5000000

  // Calculate activity level (0-1)
  const activityLevel = Math.min(1, (deliveryCount + vehicleActivity) / 30)

  // Apply progressive multiplier based on activity
  const multiplier = 1 + activityLevel * 1.5 // Max 2.5x for highest activity

  return {
    min: Math.floor(baseMin * multiplier),
    max: Math.floor(baseMax * multiplier),
  }
}

// Calculate delivery stats for a given period
const calculateDeliveryStats = (deliveries, startDate, endDate) => {
  if (!Array.isArray(deliveries) || !startDate || !endDate) {
    console.warn('Invalid inputs for calculateDeliveryStats')
    return {
      total: 0,
      completed: 0,
      partial: 0,
      pending: 0,
      cancelled: 0,
      successRate: 0,
    }
  }

  const periodDeliveries = deliveries.filter((delivery) => {
    const deliveryDate = parseDate(delivery.date)
    return deliveryDate && deliveryDate >= startDate && deliveryDate <= endDate
  })

  const total = periodDeliveries.length
  const completed = periodDeliveries.filter((d) => d.status === 'DITERIMA - SEMUA').length
  const partial = periodDeliveries.filter((d) => d.status === 'DITERIMA - SEBAGIAN').length
  const pending = periodDeliveries.filter((d) => d.status === 'KIRIM ULANG').length
  const cancelled = periodDeliveries.filter((d) => d.status.startsWith('BATAL')).length

  const successRate = total ? Math.round(((completed + partial) / total) * 100) : 0

  return {
    total,
    completed,
    partial,
    pending,
    cancelled,
    successRate,
  }
}

export function generateDeliveries(count, vehicleSchedule) {
  try {
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
        if (!date) {
          console.warn(`Invalid date: ${dateStr}`)
          continue
        }

        // Skip if not a working day
        if (!workingDays.some((d) => d.getTime() === date.getTime())) {
          continue
        }

        // Ensure date is within Q4 2024
        if (date < q4Start || date > q4End) {
          continue
        }

        // Check if it's end of month
        const monthStart = startOfMonth(date)
        const monthEnd = endOfMonth(date)
        const monthDays = workingDays
          .filter((d) => d >= monthStart && d <= monthEnd)
          .sort((a, b) => a - b)
        const isEndOfMonth = monthDays.slice(-3).some((d) => d.getTime() === date.getTime())

        // Calculate activity level for this vehicle/day
        const activityLevel = Math.min(
          1,
          deliveryCount / 10 + vehicleActivity.get(plateNumber) / 100,
        )

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
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${
            hour >= 12 ? 'PM' : 'AM'
          }`

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
          const vehicleActivityFactor = Math.min(2.0, vehicleActivity.get(plateNumber) / 100)
          const amount = Math.floor(baseAmount * activityMultiplier * vehicleActivityFactor)

          // Generate status based on probabilities and activity level
          const status = getRandomStatus(isEndOfMonth, activityLevel)

          // Generate proof image URL
          const proofImage = generateProofImageUrl(branchName, invoice)

          allDeliveries.push({
            branch: branchName,
            driver: vehicle.assignedDriver.name,
            helper: faker.helpers.arrayElement(
              branchData.drivers.filter((d) => d !== vehicle.assignedDriver.name),
            ),
            vehicleNumber: plateNumber,
            date: formatDate(date),
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
    const sortedDeliveries = allDeliveries.sort((a, b) => {
      const dateA = parseDate(a.date)
      const dateB = parseDate(b.date)
      if (!dateA || !dateB) return 0
      const dateCompare = dateA - dateB
      if (dateCompare !== 0) return dateCompare
      return a.time.localeCompare(b.time)
    })

    // Calculate stats for the current month
    const currentMonth = new Date()
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const stats = calculateDeliveryStats(sortedDeliveries, monthStart, monthEnd)

    // Calculate stats for the previous month
    const previousMonth = new Date(currentMonth)
    previousMonth.setMonth(previousMonth.getMonth() - 1)
    const previousMonthStart = startOfMonth(previousMonth)
    const previousMonthEnd = endOfMonth(previousMonth)
    const previousStats = calculateDeliveryStats(
      sortedDeliveries,
      previousMonthStart,
      previousMonthEnd,
    )

    return {
      success: true,
      data: {
        deliveries: sortedDeliveries,
        currentStats: stats,
        previousStats,
      },
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error generating deliveries:', error)
    return {
      success: false,
      error: error.message,
      data: {
        deliveries: [],
        currentStats: {
          total: 0,
          completed: 0,
          partial: 0,
          pending: 0,
          cancelled: 0,
          successRate: 0,
        },
        previousStats: {
          total: 0,
          completed: 0,
          partial: 0,
          pending: 0,
          cancelled: 0,
          successRate: 0,
        },
      },
      timestamp: new Date().toISOString(),
    }
  }
}
