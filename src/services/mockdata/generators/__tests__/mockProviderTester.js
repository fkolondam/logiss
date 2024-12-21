import { MockDataProvider } from '../../../MockDataProvider.js'

async function testMockProvider() {
  console.log('\n=== Testing Mock Data Provider ===\n')

  const provider = new MockDataProvider()

  try {
    // Test delivery fetching with filters
    console.log('Testing delivery fetching with filters...')
    const deliveryResult = await provider.fetch('deliveries', {
      branch: 'RDA SUMEDANG',
      dateRange: {
        start: '2024-10-01',
        end: '2024-10-31',
      },
    })
    console.log('\nDelivery Query Results:')
    console.log(`Total Records: ${deliveryResult.total}`)
    console.log(`Page: ${deliveryResult.page}`)
    console.log(`Limit: ${deliveryResult.limit}`)
    console.log(`Sample Record:`, deliveryResult.data[0])

    // Test delivery statistics
    console.log('\nTesting delivery statistics...')
    const deliveryStats = await provider.getDeliveryStats({
      branch: 'RDA SUMEDANG',
    })
    console.log('\nDelivery Statistics:')
    console.log(JSON.stringify(deliveryStats, null, 2))

    // Test expense statistics
    console.log('\nTesting expense statistics...')
    const expenseStats = await provider.getExpenseStats()
    console.log('\nExpense Statistics:')
    console.log(JSON.stringify(expenseStats, null, 2))

    // Test vehicle statistics
    console.log('\nTesting vehicle statistics...')
    const vehicleStats = await provider.getVehicleStats()
    console.log('\nVehicle Statistics:')
    console.log(JSON.stringify(vehicleStats, null, 2))
  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the tests
testMockProvider()
