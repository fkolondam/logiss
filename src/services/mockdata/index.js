// Import generators
import { generateDeliveryData } from './generators/deliveryGenerator.js'
import { generateExpenseData } from './generators/expenseGenerator.js'
import { generateVehicleData } from './generators/vehicleGenerator.js'

// Set date range for Q4 2024
const startDate = new Date('2024-10-01')
const endDate = new Date('2024-12-31')

// Generate mock data
const deliveriesMockData = generateDeliveryData(startDate, endDate)
const expensesMockData = generateExpenseData(startDate, endDate)
const vehiclesMockData = generateVehicleData(startDate, endDate)

// Export generated data
export {
  deliveriesMockData,
  expensesMockData,
  vehiclesMockData,
  // Export generators for direct use if needed
  generateDeliveryData,
  generateExpenseData,
  generateVehicleData,
}
