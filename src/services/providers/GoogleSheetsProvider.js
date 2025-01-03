import { DataProvider } from '../interfaces/DataProvider'
import { GoogleSheetsTransformer } from './GoogleSheetsTransformer'

export class GoogleSheetsProvider extends DataProvider {
  constructor(config) {
    super()
    this.config = config
    this.transformer = new GoogleSheetsTransformer()
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
  }

  async initialize() {
    console.log('Initializing GoogleSheetsProvider...')
    console.log('Branches URL:', this.config.branchesSheetUrl ? 'Configured' : 'Not configured')
    console.log('Deliveries URL:', this.config.deliveriesSheetUrl ? 'Configured' : 'Not configured')
    console.log('Expenses URL:', this.config.expensesSheetUrl ? 'Configured' : 'Not configured')
    console.log('Vehicles URL:', this.config.vehiclesSheetUrl ? 'Configured' : 'Not configured')
    console.log('Invoices URL:', this.config.invoicesSheetUrl ? 'Configured' : 'Not configured')

    try {
      // Load and cache branch data first as it's needed for delivery transformations
      await this.fetchBranches()
      console.log('Successfully initialized GoogleSheetsProvider')
    } catch (error) {
      console.error('Failed to initialize GoogleSheetsProvider:', error)
      throw new Error('Failed to initialize data provider: ' + error.message)
    }
  }

  async fetchBranches() {
    console.log('Fetching branches from:', this.config.branchesSheetUrl)
    try {
      const response = await fetch(this.config.branchesSheetUrl)
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status)
      }

      const csvText = await response.text()
      console.log('Received branches CSV:', csvText.substring(0, 200) + '...')

      const rows = this.parseCSV(csvText)
      console.log('Parsed branch rows:', rows.length)

      // Remove header row
      const headers = rows.shift()
      console.log('Branch headers:', headers)

      // Transform and validate branch data
      const branches = rows
        .map((row) => this.transformer.transformBranch(row))
        .filter((branch) => this.transformer.validateBranch(branch))

      console.log('Transformed branches:', branches.length)
      if (branches.length > 0) {
        console.log('Sample branch:', branches[0])
      }

      // Update branches cache in transformer
      this.transformer.setBranchesData(rows)

      return branches
    } catch (error) {
      console.error('Error in fetchBranches:', error)
      throw new Error('Failed to fetch branches: ' + error.message)
    }
  }

  async fetch(resource, params = {}) {
    // Check cache first
    const cacheKey = this.getCacheKey(resource, params)
    const cachedData = this.getFromCache(cacheKey)
    if (cachedData) {
      return cachedData
    }

    try {
      let data = []

      switch (resource) {
        case 'deliveries':
          data = await this.fetchDeliveries(params)
          break
        case 'branches':
          data = await this.fetchBranches()
          break
        case 'expenses':
          data = await this.fetchExpenses()
          break
        case 'vehicles':
          data = await this.fetchVehicles()
          break
        case 'invoices':
          data = await this.fetchInvoices()
          break
        default:
          throw new Error('Unsupported resource: ' + resource)
      }

      // Cache the result
      const result = {
        data,
        total: data.length,
        metadata:
          resource === 'deliveries'
            ? {
                cutoffDate: this.transformer.CUTOFF_DATE.toISOString(),
                filteredCount: data.length,
              }
            : {
                totalCount: data.length,
              },
      }
      this.setInCache(cacheKey, result)

      return result
    } catch (error) {
      console.error('Error in fetch:', error)
      throw error
    }
  }

  async fetchDeliveries(params = {}) {
    console.log('Fetching deliveries from:', this.config.deliveriesSheetUrl)
    try {
      const response = await fetch(this.config.deliveriesSheetUrl)
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status)
      }

      const csvText = await response.text()
      console.log('Received deliveries CSV:', csvText.substring(0, 200) + '...')

      const rows = this.parseCSV(csvText)
      console.log('Parsed delivery rows:', rows.length)

      // Remove header row and log it
      const headers = rows.shift()
      console.log('Delivery headers:', headers)

      // Transform and validate delivery data
      const deliveries = rows
        .map((row, index) => {
          try {
            if (!row || row.length < 17) {
              console.log('Skipping invalid row:', index, row)
              return null
            }
            const delivery = this.transformer.transformDelivery(row)
            if (!delivery) {
              console.log('Failed to transform delivery row:', index, row)
            }
            return delivery
          } catch (error) {
            console.error('Error transforming delivery row:', index, error, row)
            return null
          }
        })
        .filter((delivery) => {
          try {
            const isValid = delivery && this.transformer.validateDelivery(delivery)
            if (!isValid && delivery) {
              console.log('Invalid delivery:', delivery)
            }
            return isValid
          } catch (error) {
            console.error('Error validating delivery:', error)
            return false
          }
        })

      console.log('Transformed deliveries:', deliveries.length)
      if (deliveries.length > 0) {
        console.log('Sample delivery:', deliveries[0])
      }

      // Sort deliveries by date and time
      deliveries.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + (a.time || '00:00:00'))
        const dateB = new Date(b.date + ' ' + (b.time || '00:00:00'))
        return dateB - dateA // Latest first
      })

      // Apply filters if any
      return this.filterDeliveries(deliveries, params)
    } catch (error) {
      console.error('Error in fetchDeliveries:', error)
      throw new Error('Failed to fetch deliveries: ' + error.message)
    }
  }

  filterDeliveries(deliveries, params) {
    let filtered = [...deliveries]

    if (params.filter) {
      const { branchId, date, status } = params.filter

      if (branchId) {
        filtered = filtered.filter((d) => d.branchId === branchId)
      }

      if (date) {
        filtered = filtered.filter((d) => d.date === date)
      }

      if (status) {
        filtered = filtered.filter((d) => d.status === status)
      }
    }

    return filtered
  }

  parseCSV(csvText) {
    // First, normalize line endings and split into lines
    const lines = csvText
      .replace(/\r\n/g, '\n')
      .split('\n')
      .filter((line) => line.trim())

    return lines.map((line) => {
      const values = []
      let currentValue = ''
      let insideQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const nextChar = line[i + 1]

        if (char === '"') {
          if (insideQuotes && nextChar === '"') {
            // Double quotes inside quotes - add single quote
            currentValue += '"'
            i++ // Skip next quote
          } else {
            // Toggle quotes mode
            insideQuotes = !insideQuotes
          }
        } else if (char === ',' && !insideQuotes) {
          // End of value
          values.push(this.cleanValue(currentValue))
          currentValue = ''
        } else {
          currentValue += char
        }
      }

      // Add the last value
      values.push(this.cleanValue(currentValue))

      return values
    })
  }

  cleanValue(value) {
    // Remove quotes and trim whitespace
    return value.replace(/^["']|["']$/g, '').trim()
  }

  getCacheKey(resource, params) {
    return resource + ':' + JSON.stringify(params)
  }

  getFromCache(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    return null
  }

  setInCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  async fetchExpenses() {
    console.log('Fetching expenses from:', this.config.expensesSheetUrl)
    try {
      const response = await fetch(this.config.expensesSheetUrl)
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status)
      }

      const csvText = await response.text()
      console.log('Received expenses CSV:', csvText.substring(0, 200) + '...')
      console.log('Full expenses CSV:', csvText) // Log full CSV for debugging

      const rows = this.parseCSV(csvText)
      console.log('Parsed expense rows:', rows.length)

      // Remove header row and log it
      const headers = rows.shift()
      console.log('Expense headers:', headers.join(', '))
      console.log('First data row:', rows[0]?.join(', '))

      // Transform and validate expense data
      const expenses = rows
        .map((row, index) => {
          try {
            if (!row || row.length < 12) {
              // Expenses has 12 columns
              console.log('Skipping invalid row:', index, row)
              return null
            }
            const expense = this.transformer.transformExpense(row)
            if (!expense) {
              console.log('Failed to transform expense row:', index, row)
            }
            return expense
          } catch (error) {
            console.error('Error transforming expense row:', index, error, row)
            return null
          }
        })
        .filter((expense) => {
          try {
            const isValid = expense && this.transformer.validateExpense(expense)
            if (!isValid && expense) {
              console.log('Invalid expense:', expense)
            }
            return isValid
          } catch (error) {
            console.error('Error validating expense:', error)
            return false
          }
        })

      console.log('Transformed expenses:', expenses.length)
      if (expenses.length > 0) {
        console.log('Sample expense:', expenses[0])
      }

      return expenses
    } catch (error) {
      console.error('Error in fetchExpenses:', error)
      throw new Error('Failed to fetch expenses: ' + error.message)
    }
  }

  async fetchVehicles() {
    console.log('Fetching vehicles from:', this.config.vehiclesSheetUrl)
    try {
      const response = await fetch(this.config.vehiclesSheetUrl)
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status)
      }

      const csvText = await response.text()
      console.log('Received vehicles CSV:', csvText.substring(0, 200) + '...')

      const rows = this.parseCSV(csvText)
      console.log('Parsed vehicle rows:', rows.length)

      // Remove header row and log it
      const headers = rows.shift()
      console.log('Vehicle headers:', headers.join(', '))
      console.log('First data row:', rows[0]?.join(', '))

      // Transform and validate vehicle data
      const vehicles = rows
        .map((row, index) => {
          try {
            if (!row || row.length < 39) {
              // Vehicles has 39 columns
              console.log('Skipping invalid row:', index, row)
              return null
            }
            const vehicle = this.transformer.transformVehicle(row)
            if (!vehicle) {
              console.log('Failed to transform vehicle row:', index, row)
            }
            return vehicle
          } catch (error) {
            console.error('Error transforming vehicle row:', index, error, row)
            return null
          }
        })
        .filter((vehicle) => {
          try {
            const isValid = vehicle && this.transformer.validateVehicle(vehicle)
            if (!isValid && vehicle) {
              console.log('Invalid vehicle:', vehicle)
            }
            return isValid
          } catch (error) {
            console.error('Error validating vehicle:', error)
            return false
          }
        })

      console.log('Transformed vehicles:', vehicles.length)
      if (vehicles.length > 0) {
        console.log('Sample vehicle:', vehicles[0])
      }

      return vehicles
    } catch (error) {
      console.error('Error in fetchVehicles:', error)
      throw new Error('Failed to fetch vehicles: ' + error.message)
    }
  }

  async fetchInvoices() {
    console.log('Fetching invoices from:', this.config.invoicesSheetUrl)
    try {
      const response = await fetch(this.config.invoicesSheetUrl)
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status)
      }

      const csvText = await response.text()
      console.log('Received invoices CSV:', csvText.substring(0, 200) + '...')

      const rows = this.parseCSV(csvText)
      console.log('Parsed invoice rows:', rows.length)

      // Remove header row and log it
      const headers = rows.shift()
      console.log('Invoice headers:', headers.join(', '))
      console.log('First data row:', rows[0]?.join(', '))

      // Transform and validate invoice data
      const invoices = rows
        .map((row, index) => {
          try {
            if (!row || row.length < 17) {
              // Invoices has 17 columns
              console.log('Skipping invalid row:', index, row)
              return null
            }
            const invoice = this.transformer.transformInvoice(row)
            if (!invoice) {
              console.log('Failed to transform invoice row:', index, row)
            }
            return invoice
          } catch (error) {
            console.error('Error transforming invoice row:', index, error, row)
            return null
          }
        })
        .filter((invoice) => {
          try {
            const isValid = invoice && this.transformer.validateInvoice(invoice)
            if (!isValid && invoice) {
              console.log('Invalid invoice:', invoice)
            }
            return isValid
          } catch (error) {
            console.error('Error validating invoice:', error)
            return false
          }
        })

      console.log('Transformed invoices:', invoices.length)
      if (invoices.length > 0) {
        console.log('Sample invoice:', invoices[0])
      }

      return invoices
    } catch (error) {
      console.error('Error in fetchInvoices:', error)
      throw new Error('Failed to fetch invoices: ' + error.message)
    }
  }

  clearCache() {
    this.cache.clear()
  }
}
