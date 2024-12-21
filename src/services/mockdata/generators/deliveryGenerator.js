import {
  branchConfig,
  amountRanges,
  deliveryStatusConfig,
  paymentMethodConfig,
  peakTimeConfig,
} from './branchData.js'
import { getWorkingDaysInRange, getRandomTimeInWorkingHours, formatDate } from './dateUtils.js'
import {
  getRandomAmount,
  getRandomStatus,
  getRandomCoordinates,
  generateInvoiceNumber,
  generateProofImageUrl,
} from './randomUtils.js'

// Helper function to check if a customer should receive delivery on a given date based on their cycle
const shouldDeliverToCustomer = (customer, date) => {
  const dayOfMonth = date.getDate()
  const dayOfWeek = date.getDay()

  switch (customer.deliveryCycle) {
    case 'weekly':
      // Deliver on specific days based on customer name hash
      const nameHash = (customer.name.length % 5) + 1 // Maps to Mon-Fri (1-5)
      return dayOfWeek === nameHash
    case 'biweekly':
      // First delivery in first week, second delivery in third week
      // Use customer name hash to determine exact day
      const biweeklyDay = (customer.name.length % 5) + 1 // Maps to days 1-5
      return dayOfMonth === biweeklyDay || dayOfMonth === biweeklyDay + 14
    case 'monthly':
      // Deliver on a specific day of first week based on customer name
      const monthlyDay = (customer.name.length % 5) + 1 // Maps to days 1-5
      return dayOfMonth === monthlyDay
    default:
      return false
  }
}

const generateDeliveryData = (startDate, endDate) => {
  const deliveries = []
  let deliveryIndex = 0

  // Get all working days in the date range
  const workingDays = getWorkingDaysInRange(new Date(startDate), new Date(endDate))

  // Generate deliveries for each branch
  Object.entries(branchConfig).forEach(([branchName, branchData]) => {
    const { vehicles, drivers, customers, coordinates } = branchData

    // For each working day
    workingDays.forEach((date) => {
      // Determine if it's peak time (used for delivery count calculation)
      const isPeakTime = isInPeakPeriod(date)

      // Get eligible customers for this date
      const eligibleCustomers = customers.filter((customer) =>
        shouldDeliverToCustomer(customer, date),
      )

      // Skip if no eligible customers
      if (eligibleCustomers.length === 0) return

      // For each vehicle in the branch
      vehicles.forEach((vehicleNumber, vehicleIndex) => {
        // Get assigned driver for this vehicle (maintain consistent assignment)
        const driver = drivers[vehicleIndex % drivers.length]

        // Distribute customers evenly across vehicles
        const customersForVehicle = eligibleCustomers.filter(
          (_, index) => index % vehicles.length === vehicleIndex,
        )

        // Process each customer assigned to this vehicle
        customersForVehicle.forEach((customer) => {
          // Generate random coordinates within branch radius
          const deliveryCoords = getRandomCoordinates(
            coordinates.center.lat,
            coordinates.center.lng,
            coordinates.radius,
          )

          // Determine amount range based on probabilities and peak time
          const amountRange =
            Math.random() < 0.4
              ? amountRanges.small
              : Math.random() < 0.75
                ? amountRanges.medium
                : amountRanges.large

          // Generate delivery data
          const delivery = {
            id: 14900 + deliveryIndex,
            branch: branchName,
            driver: driver.name,
            helper: driver.helper,
            vehicleNumber,
            date: formatDate(date),
            time: getRandomTimeInWorkingHours(),
            customer: customer.name,
            location: customer.location,
            invoice: generateInvoiceNumber(branchName, date, deliveryIndex),
            amount: getRandomAmount(amountRange.min, amountRange.max),
            status: getRandomStatus(deliveryStatusConfig),
            coordinates: deliveryCoords,
            paymentMethod: Math.random() < paymentMethodConfig.TUNAI ? 'TUNAI' : 'KREDIT',
            region: branchData.region,
          }

          // Add proof image after other fields are set
          delivery.proofImage = generateProofImageUrl(delivery.branch, delivery.invoice)

          deliveries.push(delivery)
          deliveryIndex++
        })
      })
    })
  })

  // Sort deliveries by date and time
  return deliveries.sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time)
    const dateB = new Date(b.date + ' ' + b.time)
    return dateA - dateB
  })
}

// Helper function to check if a date is in a peak period
const isInPeakPeriod = (date) => {
  const day = date.getDate()
  const month = date.getMonth() + 1

  // December peak period (last two weeks)
  if (month === 12 && day >= peakTimeConfig.peakPeriods.december.startDay) {
    return true
  }

  // Monthly peak period (last week)
  if (day >= peakTimeConfig.peakPeriods.monthly.startDay) {
    return true
  }

  return false
}

export { generateDeliveryData }
