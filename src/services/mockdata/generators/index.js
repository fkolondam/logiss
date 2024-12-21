import { generateDeliveries } from './deliveryGenerator'
import { generateExpenses } from './expenseGenerator'
import { generateVehicles } from './vehicleGenerator'
import { generateBranchData } from './branchData'
import {
  getWorkingDaysInRange,
  getRandomTimeInWorkingHours,
  formatDate,
  parseDate,
  ensureQ4Date,
  isWeekend,
  isHoliday,
  isWorkingDay,
  getQ4DateRange,
  startOfMonth,
  endOfMonth,
} from './dateUtils'
import {
  getRandomNumber,
  getRandomAmount,
  getRandomItem,
  getRandomStatus,
  getRandomCoordinates,
  generateInvoiceNumber,
  generateProofImageUrl,
  getFuelLevel,
} from './randomUtils'

// Generate mock data for Q4 2024
export function generateMockData() {
  try {
    console.log('Generating mock data...')

    // Get Q4 2024 date range
    const { start: q4Start, end: q4End } = getQ4DateRange()
    console.log('Q4 date range:', formatDate(q4Start), 'to', formatDate(q4End))

    // Get working days in Q4 2024
    const workingDays = getWorkingDaysInRange(q4Start, q4End)
    console.log('Total working days:', workingDays.length)

    // Generate branch data first since other generators depend on it
    const branchData = generateBranchData()
    console.log('Generated branch data:', branchData.branches.length, 'branches')

    // Generate vehicles first
    const vehicles = generateVehicles()
    console.log('Generated vehicles:', vehicles.length)

    // Create vehicle assignment schedule
    const vehicleSchedule = new Map()
    vehicles.forEach((vehicle) => {
      // Assign base delivery capacity based on vehicle type
      const baseCapacity = vehicle.type === 'Truck' ? 12 : 8
      vehicleSchedule.set(vehicle.plateNumber, {
        vehicle,
        dailyDeliveries: new Map(), // Map of date -> delivery count
        dailyExpenses: new Map(), // Map of date -> expenses
      })
    })

    // Calculate total deliveries needed
    let totalDeliveries = 0
    const deliveriesByDate = new Map()

    // Group working days by month
    const workingDaysByMonth = workingDays.reduce((acc, date) => {
      const month = date.getMonth()
      if (!acc[month]) acc[month] = []
      acc[month].push(date)
      return acc
    }, {})

    // Distribute deliveries with emphasis on end of month
    Object.values(workingDaysByMonth).forEach((monthDays) => {
      const regularDays = monthDays.slice(0, -3)
      const endMonthDays = monthDays.slice(-3)

      // Regular days: ensure each vehicle has at least 10 deliveries
      regularDays.forEach((date) => {
        const dateStr = formatDate(date)
        let dailyDeliveries = 0

        vehicleSchedule.forEach((schedule) => {
          const vehicleDeliveries = 10 // Ensure at least 10 deliveries
          dailyDeliveries += vehicleDeliveries
          schedule.dailyDeliveries.set(dateStr, vehicleDeliveries)
        })

        deliveriesByDate.set(dateStr, dailyDeliveries)
        totalDeliveries += dailyDeliveries
      })

      // Last 3 days: increased deliveries
      endMonthDays.forEach((date, index) => {
        const dateStr = formatDate(date)
        const increase = [1.5, 1.75, 2.0][index] // 50%, 75%, 100% increase
        let dailyDeliveries = 0

        vehicleSchedule.forEach((schedule) => {
          const vehicleDeliveries = Math.round(10 * increase) // Ensure increased deliveries
          dailyDeliveries += vehicleDeliveries
          schedule.dailyDeliveries.set(dateStr, vehicleDeliveries)
        })

        deliveriesByDate.set(dateStr, dailyDeliveries)
        totalDeliveries += dailyDeliveries
      })
    })

    console.log('Total deliveries scheduled:', totalDeliveries)

    // Generate data using schedule
    const deliveriesResponse = generateDeliveries(totalDeliveries, vehicleSchedule)
    if (!deliveriesResponse?.success) {
      throw new Error('Failed to generate deliveries')
    }
    console.log('Generated deliveries:', deliveriesResponse.data.deliveries.length)

    const expenses = generateExpenses(
      Array.from(deliveriesByDate.values()).reduce((a, b) => a + b, 0),
      vehicleSchedule,
    )
    console.log('Generated expenses:', expenses.length)

    // Calculate monthly stats
    const monthlyStats = Object.entries(workingDaysByMonth).reduce((acc, [month, days]) => {
      const monthDeliveries = days.reduce(
        (sum, date) => sum + (deliveriesByDate.get(formatDate(date)) || 0),
        0,
      )

      const monthExpenses = expenses
        .filter((e) => {
          const expenseDate = parseDate(e.date)
          return expenseDate && expenseDate.getMonth() === parseInt(month)
        })
        .reduce((sum, e) => sum + (e.amount || 0), 0)

      acc[month] = {
        workingDays: days.length,
        deliveries: monthDeliveries,
        expenses: monthExpenses,
        averageDeliveriesPerDay: Math.round(monthDeliveries / days.length),
      }
      return acc
    }, {})

    // Return structured data
    const result = {
      success: true,
      data: {
        vehicles: vehicles || [],
        deliveries: {
          deliveries: deliveriesResponse.data.deliveries || [],
          currentStats: deliveriesResponse.data.currentStats || {
            total: 0,
            completed: 0,
            partial: 0,
            pending: 0,
            cancelled: 0,
            successRate: 0,
          },
          previousStats: deliveriesResponse.data.previousStats || {
            total: 0,
            completed: 0,
            partial: 0,
            pending: 0,
            cancelled: 0,
            successRate: 0,
          },
        },
        expenses: expenses || [],
        branchData: branchData || {},
        stats: {
          totalWorkingDays: workingDays.length,
          totalDeliveries,
          totalExpenses: expenses.length,
          averageDeliveriesPerDay: Math.round(totalDeliveries / workingDays.length),
          averageDeliveriesPerVehicle: Math.round(totalDeliveries / (vehicles?.length || 1)),
          monthlyStats,
        },
      },
      timestamp: new Date().toISOString(),
    }

    console.log('Mock data generation completed successfully')
    return result
  } catch (error) {
    console.error('Error generating mock data:', error)
    // Return safe default data structure with error flag
    return {
      success: false,
      error: error.message,
      data: {
        vehicles: [],
        deliveries: {
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
        expenses: [],
        branchData: {},
        stats: {
          totalWorkingDays: 0,
          totalDeliveries: 0,
          totalExpenses: 0,
          averageDeliveriesPerDay: 0,
          averageDeliveriesPerVehicle: 0,
          monthlyStats: {},
        },
      },
      timestamp: new Date().toISOString(),
    }
  }
}

// Export individual generators for direct use
export { generateDeliveries, generateExpenses, generateVehicles, generateBranchData }

// Export utility functions
export const dateUtils = {
  getWorkingDaysInRange,
  getRandomTimeInWorkingHours,
  formatDate,
  parseDate,
  ensureQ4Date,
  isWeekend,
  isHoliday,
  isWorkingDay,
  startOfMonth,
  endOfMonth,
}

export const randomUtils = {
  getRandomNumber,
  getRandomAmount,
  getRandomItem,
  getRandomStatus,
  getRandomCoordinates,
  generateInvoiceNumber,
  generateProofImageUrl,
  getFuelLevel,
}
