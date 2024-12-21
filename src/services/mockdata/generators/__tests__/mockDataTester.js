import { generateMockData } from '../index.js'
import { deliveriesMockData, expensesMockData, vehiclesMockData } from '../index.js'

// Test mock data generation
console.log('\n=== Mock Data Generation Test ===\n')

// 1. Test Direct Generation
console.log('1. Direct Generation Test:')
const mockData = generateMockData()
console.log(`- Deliveries: ${mockData.deliveries?.length || 0} records`)
console.log(`- Expenses: ${mockData.expenses?.length || 0} records`)
console.log(`- Vehicles: ${mockData.vehicles?.length || 0} records`)

// 2. Test Pre-generated Data
console.log('\n2. Pre-generated Data Test:')
console.log(`- Deliveries: ${deliveriesMockData?.length || 0} records`)
console.log(`- Expenses: ${expensesMockData?.length || 0} records`)
console.log(`- Vehicles: ${vehiclesMockData?.length || 0} records`)

// 3. Sample Data Analysis
console.log('\n3. Sample Data Analysis:')

if (mockData.deliveries?.length > 0) {
  const sampleDelivery = mockData.deliveries[0]
  console.log('\nSample Delivery:')
  console.log(JSON.stringify(sampleDelivery, null, 2))
}

if (mockData.expenses?.length > 0) {
  const sampleExpense = mockData.expenses[0]
  console.log('\nSample Expense:')
  console.log(JSON.stringify(sampleExpense, null, 2))
}

if (mockData.vehicles?.length > 0) {
  const sampleVehicle = mockData.vehicles[0]
  console.log('\nSample Vehicle:')
  console.log(JSON.stringify(sampleVehicle, null, 2))
}

// 4. Data Distribution Analysis
console.log('\n4. Data Distribution Analysis:')

if (mockData.deliveries?.length > 0) {
  const statusCount = mockData.deliveries.reduce((acc, delivery) => {
    acc[delivery.status] = (acc[delivery.status] || 0) + 1
    return acc
  }, {})

  console.log('\nDelivery Status Distribution:')
  Object.entries(statusCount).forEach(([status, count]) => {
    const percentage = ((count / mockData.deliveries.length) * 100).toFixed(2)
    console.log(`- ${status}: ${count} (${percentage}%)`)
  })
}

// 5. Date Range Analysis
console.log('\n5. Date Range Analysis:')

if (mockData.deliveries?.length > 0) {
  const dates = mockData.deliveries.map((d) => new Date(d.date))
  const minDate = new Date(Math.min(...dates))
  const maxDate = new Date(Math.max(...dates))

  console.log(
    `Date Range: ${minDate.toISOString().split('T')[0]} to ${maxDate.toISOString().split('T')[0]}`,
  )
}

// 6. Branch Analysis
console.log('\n6. Branch Analysis:')

if (mockData.deliveries?.length > 0) {
  const branchDeliveries = mockData.deliveries.reduce((acc, delivery) => {
    acc[delivery.branch] = (acc[delivery.branch] || 0) + 1
    return acc
  }, {})

  console.log('\nDeliveries per Branch:')
  Object.entries(branchDeliveries).forEach(([branch, count]) => {
    console.log(`- ${branch}: ${count} deliveries`)
  })
}
