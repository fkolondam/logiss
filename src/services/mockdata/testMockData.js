import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateMockData } from './generators/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

    // Print Statistics
    console.log('\nData Generation Stats:')
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
