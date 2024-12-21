import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateMockData } from './generators/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function calculateDeliveryStatistics(deliveries) {
  // Per Branch Statistics
  const branchStats = {}
  // Per Vehicle Statistics
  const vehicleStats = {}
  // Per Customer Category Statistics
  const categoryStats = {
    weekly: { count: 0, amount: 0 },
    biweekly: { count: 0, amount: 0 },
    monthly: { count: 0, amount: 0 },
  }
  // Per Payment Method Statistics
  const paymentStats = {
    TUNAI: { count: 0, amount: 0 },
    KREDIT: { count: 0, amount: 0 },
  }
  // Per Status Statistics
  const statusStats = {}
  // Per Region Statistics
  const regionStats = {}

  deliveries.forEach((delivery) => {
    // Branch Statistics
    if (!branchStats[delivery.branch]) {
      branchStats[delivery.branch] = {
        totalDeliveries: 0,
        totalAmount: 0,
        vehicles: new Set(),
        drivers: new Set(),
        customers: new Set(),
        statuses: {},
      }
    }
    branchStats[delivery.branch].totalDeliveries++
    branchStats[delivery.branch].totalAmount += delivery.amount
    branchStats[delivery.branch].vehicles.add(delivery.vehicleNumber)
    branchStats[delivery.branch].drivers.add(delivery.driver)
    branchStats[delivery.branch].customers.add(delivery.customer)
    branchStats[delivery.branch].statuses[delivery.status] =
      (branchStats[delivery.branch].statuses[delivery.status] || 0) + 1

    // Vehicle Statistics
    if (!vehicleStats[delivery.vehicleNumber]) {
      vehicleStats[delivery.vehicleNumber] = {
        totalDeliveries: 0,
        totalAmount: 0,
        branch: delivery.branch,
      }
    }
    vehicleStats[delivery.vehicleNumber].totalDeliveries++
    vehicleStats[delivery.vehicleNumber].totalAmount += delivery.amount

    // Payment Method Statistics
    paymentStats[delivery.paymentMethod].count++
    paymentStats[delivery.paymentMethod].amount += delivery.amount

    // Status Statistics
    if (!statusStats[delivery.status]) {
      statusStats[delivery.status] = { count: 0, amount: 0 }
    }
    statusStats[delivery.status].count++
    statusStats[delivery.status].amount += delivery.amount

    // Region Statistics
    if (!regionStats[delivery.region]) {
      regionStats[delivery.region] = { count: 0, amount: 0, branches: new Set() }
    }
    regionStats[delivery.region].count++
    regionStats[delivery.region].amount += delivery.amount
    regionStats[delivery.region].branches.add(delivery.branch)
  })

  return {
    branchStats,
    vehicleStats,
    categoryStats,
    paymentStats,
    statusStats,
    regionStats,
  }
}

function printStatistics(stats) {
  console.log('\n=== Detailed Statistics ===\n')

  // Branch Statistics
  console.log('Branch Statistics:')
  console.log('-----------------')
  Object.entries(stats.branchStats).forEach(([branch, data]) => {
    console.log(`\n${branch}:`)
    console.log(`  Total Deliveries: ${data.totalDeliveries}`)
    console.log(`  Total Amount: Rp ${data.totalAmount.toLocaleString()}`)
    console.log(`  Unique Vehicles: ${data.vehicles.size}`)
    console.log(`  Unique Drivers: ${data.drivers.size}`)
    console.log(`  Unique Customers: ${data.customers.size}`)
    console.log('  Delivery Status Distribution:')
    Object.entries(data.statuses).forEach(([status, count]) => {
      console.log(`    ${status}: ${count}`)
    })
  })

  // Vehicle Statistics
  console.log('\nVehicle Statistics:')
  console.log('-----------------')
  Object.entries(stats.vehicleStats).forEach(([vehicle, data]) => {
    console.log(`\n${vehicle} (${data.branch}):`)
    console.log(`  Total Deliveries: ${data.totalDeliveries}`)
    console.log(`  Total Amount: Rp ${data.totalAmount.toLocaleString()}`)
  })

  // Payment Method Statistics
  console.log('\nPayment Method Statistics:')
  console.log('-----------------------')
  Object.entries(stats.paymentStats).forEach(([method, data]) => {
    console.log(`\n${method}:`)
    console.log(`  Total Transactions: ${data.count}`)
    console.log(`  Total Amount: Rp ${data.amount.toLocaleString()}`)
  })

  // Status Statistics
  console.log('\nDelivery Status Statistics:')
  console.log('-------------------------')
  Object.entries(stats.statusStats).forEach(([status, data]) => {
    console.log(`\n${status}:`)
    console.log(`  Total Deliveries: ${data.count}`)
    console.log(`  Total Amount: Rp ${data.amount.toLocaleString()}`)
  })

  // Region Statistics
  console.log('\nRegion Statistics:')
  console.log('-----------------')
  Object.entries(stats.regionStats).forEach(([region, data]) => {
    console.log(`\n${region}:`)
    console.log(`  Total Deliveries: ${data.count}`)
    console.log(`  Total Amount: Rp ${data.amount.toLocaleString()}`)
    console.log(`  Number of Branches: ${data.branches.size}`)
  })
}

async function exportMockData() {
  console.log('\n=== Generating Mock Data ===\n')

  try {
    // Generate data
    const mockData = generateMockData()

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'output')
    await fs.mkdir(outputDir, { recursive: true })

    // Export as JSON
    const jsonOutputs = {
      'deliveries.json': mockData.deliveries,
      'expenses.json': mockData.expenses,
      'vehicles.json': mockData.vehicles,
    }

    for (const [filename, data] of Object.entries(jsonOutputs)) {
      const filePath = path.join(outputDir, filename)
      await fs.writeFile(filePath, JSON.stringify(data, null, 2))
      console.log(`JSON exported: ${filename}`)
    }

    // Export as CSV
    const csvOutputs = {
      'deliveries.csv': convertToCSV(mockData.deliveries),
      'expenses.csv': convertToCSV(mockData.expenses),
      'vehicles.csv': convertToCSV(mockData.vehicles),
    }

    for (const [filename, data] of Object.entries(csvOutputs)) {
      const filePath = path.join(outputDir, filename)
      await fs.writeFile(filePath, data)
      console.log(`CSV exported: ${filename}`)
    }

    // Calculate and print statistics
    const statistics = calculateDeliveryStatistics(mockData.deliveries)
    printStatistics(statistics)

    // Print basic stats
    console.log('\nBasic Data Generation Stats:')
    console.log('-----------------------')
    console.log(`Deliveries: ${mockData.deliveries.length} records`)
    console.log(`Expenses: ${mockData.expenses.length} records`)
    console.log(`Vehicles: ${mockData.vehicles.length} records`)
    console.log(`\nFiles exported to: ${outputDir}`)
  } catch (error) {
    console.error('Error generating mock data:', error)
  }
}

function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) return ''

  // Get headers from first object
  const headers = Object.keys(flattenObject(data[0]))

  // Create CSV content
  const csvRows = [
    headers.join(','), // Header row
    ...data.map((row) => {
      const flatRow = flattenObject(row)
      return headers
        .map((header) => {
          const value = flatRow[header] ?? ''
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        })
        .join(',')
    }),
  ]

  return csvRows.join('\n')
}

function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '_' : ''
    if (
      typeof obj[k] === 'object' &&
      obj[k] !== null &&
      !Array.isArray(obj[k]) &&
      !(obj[k] instanceof Date)
    ) {
      Object.assign(acc, flattenObject(obj[k], pre + k))
    } else {
      acc[pre + k] = Array.isArray(obj[k]) ? JSON.stringify(obj[k]) : obj[k]
    }
    return acc
  }, {})
}

// Run the export
exportMockData()
