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
  getQ4DateRange
} from './dateUtils'
import {
  getRandomNumber,
  getRandomAmount,
  getRandomItem,
  getRandomStatus,
  getRandomCoordinates,
  generateInvoiceNumber,
  generateProofImageUrl,
  getFuelLevel
} from './randomUtils'

// Generate mock data for Q4 2024
export function generateMockData() {
  // Get Q4 2024 date range
  const { start: q4Start, end: q4End } = getQ4DateRange()
  
  // Get working days in Q4 2024
  const workingDays = getWorkingDaysInRange(q4Start, q4End)

  // Generate branch data first since other generators depend on it
  const branchData = generateBranchData()

  // Generate vehicles first
  const vehicles = generateVehicles()

  // Create vehicle assignment schedule
  const vehicleSchedule = new Map()
  vehicles.forEach((vehicle, index) => {
    // Assign base delivery capacity based on vehicle type and index
    const baseCapacity = vehicle.type === 'Truck' ? 12 : 8
    vehicleSchedule.set(vehicle.plateNumber, {
      vehicle,
      dailyDeliveries: new Map(), // Map of date -> delivery count
      dailyExpenses: new Map()    // Map of date -> expenses
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
  Object.values(workingDaysByMonth).forEach(monthDays => {
    const regularDays = monthDays.slice(0, -3)
    const endMonthDays = monthDays.slice(-3)

    // Regular days: ensure each vehicle has at least 10 deliveries
    regularDays.forEach(date => {
      const dateStr = formatDate(date)
      let dailyDeliveries = 0

      vehicleSchedule.forEach((schedule, plateNumber) => {
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

      vehicleSchedule.forEach((schedule, plateNumber) => {
        const vehicleDeliveries = Math.round(10 * increase) // Ensure increased deliveries
        dailyDeliveries += vehicleDeliveries
        schedule.dailyDeliveries.set(dateStr, vehicleDeliveries)
      })

      deliveriesByDate.set(dateStr, dailyDeliveries)
      totalDeliveries += dailyDeliveries
    })
  })

  // Generate data using schedule
  const deliveries = generateDeliveries(totalDeliveries, vehicleSchedule)
  const expenses = generateExpenses(
    Array.from(deliveriesByDate.values()).reduce((a, b) => a + b, 0),
    vehicleSchedule
  )

  return {
    vehicles,
    deliveries,
    expenses,
    branchData,
    stats: {
      totalWorkingDays: workingDays.length,
      totalDeliveries,
      totalExpenses: expenses.length,
      averageDeliveriesPerDay: Math.round(totalDeliveries / workingDays.length),
      averageDeliveriesPerVehicle: Math.round(totalDeliveries / vehicles.length),
      monthlyStats: Object.entries(workingDaysByMonth).reduce((acc, [month, days]) => {
        const monthDeliveries = days.reduce((sum, date) => sum + (deliveriesByDate.get(formatDate(date)) || 0), 0)
        const monthExpenses = expenses.filter(e => {
          const expenseDate = parseDate(e.date)
          return expenseDate.getMonth() === parseInt(month)
        }).reduce((sum, e) => sum + e.amount, 0)
        
        acc[month] = {
          workingDays: days.length,
          deliveries: monthDeliveries,
          expenses: monthExpenses,
          averageDeliveriesPerDay: Math.round(monthDeliveries / days.length)
        }
        return acc
      }, {})
    }
  }
}

// Export individual generators for direct use
export {
  generateDeliveries,
  generateExpenses,
  generateVehicles,
  generateBranchData
}

// Export utility functions
export const dateUtils = {
  getWorkingDaysInRange,
  getRandomTimeInWorkingHours,
  formatDate,
  parseDate,
  ensureQ4Date,
  isWeekend,
  isHoliday,
  isWorkingDay
}

export const randomUtils = {
  getRandomNumber,
  getRandomAmount,
  getRandomItem,
  getRandomStatus,
  getRandomCoordinates,
  generateInvoiceNumber,
  generateProofImageUrl,
  getFuelLevel
}
