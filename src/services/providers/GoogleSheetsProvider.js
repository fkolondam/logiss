import { DataProvider } from '../interfaces/DataProvider'
import { GoogleSheetsTransformer } from './GoogleSheetsTransformer'

export class GoogleSheetsProvider extends DataProvider {
  constructor(config) {
    super()
    this.config = config
    this.transformer = new GoogleSheetsTransformer()
    this.cache = new Map()
    this.CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache
  }

  getCacheKey(resource, params = {}) {
    return `${resource}:${JSON.stringify(params)}`
  }

  getCachedData(resource, params = {}) {
    const key = this.getCacheKey(resource, params)
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`Using cached data for ${key}`)
      return cached.data
    }
    return null
  }

  setCachedData(resource, params = {}, data) {
    const key = this.getCacheKey(resource, params)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
    console.log(`Cached data for ${key}`)
  }

  clearCache() {
    this.cache.clear()
    console.log('Provider cache cleared')
  }

  async initialize() {
    console.log('Initializing GoogleSheetsProvider...')
    console.log('Branches URL:', this.config.branchesSheetUrl ? 'Configured' : 'Not configured')
    console.log('Deliveries URL:', this.config.deliveriesSheetUrl ? 'Configured' : 'Not configured')
    console.log('Expenses URL:', this.config.expensesSheetUrl ? 'Configured' : 'Not configured')
    console.log('Vehicles URL:', this.config.vehiclesSheetUrl ? 'Configured' : 'Not configured')
    console.log('Invoices URL:', this.config.invoicesSheetUrl ? 'Configured' : 'Not configured')

    try {
      // Load branch data first as it's needed for delivery transformations
      await this.fetchBranches()
      console.log('Successfully initialized GoogleSheetsProvider')
    } catch (error) {
      console.error('Failed to initialize GoogleSheetsProvider:', error)
      throw new Error('Failed to initialize data provider: ' + error.message)
    }
  }

  async fetch(resource, params = {}) {
    try {
      console.log(`Fetching ${resource} with params:`, params)

      // Check cache first
      const cachedData = this.getCachedData(resource, params)
      if (cachedData) {
        return {
          data: cachedData,
          total: cachedData.length,
          metadata: {
            totalCount: cachedData.length,
            fromCache: true,
          },
        }
      }

      let data = []
      switch (resource) {
        case 'deliveries':
          data = await this.fetchDeliveries(params)
          break
        case 'branches':
          data = await this.fetchBranches()
          break
        case 'expenses':
          data = await this.fetchExpenses(params)
          break
        case 'vehicles':
          data = await this.fetchVehicles(params)
          break
        case 'invoices':
          data = await this.fetchInvoices(params)
          break
        default:
          throw new Error('Unsupported resource: ' + resource)
      }

      // Cache the fetched data
      this.setCachedData(resource, params, data)

      // Log the fetched data for debugging
      console.log(`Fetched ${resource} data:`, {
        count: data.length,
        sample: data.length > 0 ? data[0] : null,
      })

      return {
        data,
        total: data.length,
        metadata: {
          totalCount: data.length,
        },
      }
    } catch (error) {
      console.error('Error in fetch:', error)
      throw error
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

  async fetchDeliveries(params = {}) {
    console.log('Fetching deliveries from:', this.config.deliveriesSheetUrl)
    try {
      console.log('Making fetch request for deliveries...')
      const response = await fetch(this.config.deliveriesSheetUrl)
      console.log('Delivery response status:', response.status)
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status)
      }

      const csvText = await response.text()
      console.log('Received deliveries CSV length:', csvText.length)
      console.log('First 200 chars of CSV:', csvText.substring(0, 200))

      console.log('Parsing CSV to rows...')
      const rows = this.parseCSV(csvText)
      console.log('Total delivery rows parsed:', rows.length)

      // Remove header row and log it
      const headers = rows.shift()
      console.log('Delivery headers:', headers)
      console.log('First data row:', rows[0])

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

      if (status) {
        filtered = filtered.filter((d) => d.status === status)
      }
    }

    // Apply date range filtering
    if (params.dateRange) {
      const { start, end } = params.dateRange
      const startDate = new Date(start)
      const endDate = new Date(end)

      filtered = filtered.filter((delivery) => {
        const deliveryDate = new Date(delivery.date)
        return deliveryDate >= startDate && deliveryDate <= endDate
      })
    }

    return filtered
  }

  filterExpenses(expenses, params) {
    let filtered = [...expenses]

    // Apply date range filtering
    if (params.dateRange) {
      const { start, end } = params.dateRange
      const startDate = new Date(start)
      const endDate = new Date(end)

      filtered = filtered.filter((expense) => {
        const expenseDate = new Date(expense.date)
        return expenseDate >= startDate && expenseDate <= endDate
      })
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

  async fetchExpenses() {
    console.log('Fetching expenses from:', this.config.expensesSheetUrl)
    try {
      const response = await fetch(this.config.expensesSheetUrl)
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status)
      }

      const csvText = await response.text()
      console.log('Received expenses CSV:', csvText.substring(0, 200) + '...')

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
}
