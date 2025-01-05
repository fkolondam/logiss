import { DataProvider } from '../interfaces/DataProvider'
import { GoogleSheetsTransformer } from './GoogleSheetsTransformer'

export class GoogleSheetsProvider extends DataProvider {
  constructor(config) {
    super()
    this.config = config
    this.transformer = new GoogleSheetsTransformer()
    this.cache = new Map()
    this.CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache
    this.setupCacheRefresh()
    this.cacheRefreshInterval = null
  }

  setupCacheRefresh() {
    // Clear any existing interval
    if (this.cacheRefreshInterval) {
      clearInterval(this.cacheRefreshInterval)
    }

    // Set up periodic cache refresh
    this.cacheRefreshInterval = setInterval(() => {
      if (this.cache.size > 0) {
        this.clearCache()
      }
    }, this.CACHE_DURATION)
  }

  dispose() {
    if (this.cacheRefreshInterval) {
      clearInterval(this.cacheRefreshInterval)
      this.cacheRefreshInterval = null
    }
    this.clearCache()
  }

  getCacheKey(resource, params = {}) {
    return `${resource}:${JSON.stringify(params)}`
  }

  getCachedData(resource, params = {}) {
    const key = this.getCacheKey(resource, params)
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
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
  }

  clearCache() {
    this.cache.clear()
  }

  async initialize() {
    try {
      // Load branch data first as it's needed for delivery transformations
      await this.fetchBranches()
    } catch (error) {
      throw new Error('Failed to initialize data provider: ' + error.message)
    }
  }

  async fetch(resource, params = {}) {
    try {
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

      return {
        data,
        total: data.length,
        metadata: {
          totalCount: data.length,
        },
      }
    } catch (error) {
      throw error
    }
  }

  async fetchBranches() {
    try {
      const response = await fetch(this.config.branchesSheetUrl)
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status)
      }

      const csvText = await response.text()
      const rows = this.parseCSV(csvText)

      // Remove header row
      rows.shift()

      // Transform and validate branch data
      const branches = rows
        .map((row) => this.transformer.transformBranch(row))
        .filter((branch) => this.transformer.validateBranch(branch))

      // Update branches cache in transformer
      this.transformer.setBranchesData(rows)

      return branches
    } catch (error) {
      throw new Error('Failed to fetch branches: ' + error.message)
    }
  }

  async fetchDeliveries(params = {}) {
    try {
      const response = await fetch(this.config.deliveriesSheetUrl)
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status)
      }

      const csvText = await response.text()
      const rows = this.parseCSV(csvText)
      rows.shift() // Remove header row

      const deliveries = rows
        .map((row) => (row.length >= 17 ? this.transformer.transformDelivery(row) : null))
        .filter((delivery) => delivery && this.transformer.validateDelivery(delivery))
        .sort((a, b) => {
          const dateA = new Date(a.date + ' ' + (a.time || '00:00:00'))
          const dateB = new Date(b.date + ' ' + (b.time || '00:00:00'))
          return dateB - dateA // Latest first
        })

      return this.filterDeliveries(deliveries, params)
    } catch (error) {
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

  async fetchExpenses(params = {}) {
    try {
      const response = await fetch(this.config.expensesSheetUrl)
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status)
      }

      const csvText = await response.text()
      const rows = this.parseCSV(csvText)
      rows.shift() // Remove header row

      const expenses = rows
        .map((row) => (row.length >= 12 ? this.transformer.transformExpense(row) : null))
        .filter((expense) => expense && this.transformer.validateExpense(expense))

      return this.filterExpenses(expenses, params)
    } catch (error) {
      throw new Error('Failed to fetch expenses: ' + error.message)
    }
  }

  async fetchVehicles(params = {}) {
    try {
      const response = await fetch(this.config.vehiclesSheetUrl)
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status)
      }

      const csvText = await response.text()
      const rows = this.parseCSV(csvText)
      rows.shift() // Remove header row

      const vehicles = rows
        .map((row) => (row.length >= 39 ? this.transformer.transformVehicle(row) : null))
        .filter((vehicle) => vehicle && this.transformer.validateVehicle(vehicle))

      return vehicles
    } catch (error) {
      throw new Error('Failed to fetch vehicles: ' + error.message)
    }
  }

  async fetchInvoices(params = {}) {
    try {
      const response = await fetch(this.config.invoicesSheetUrl)
      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status)
      }

      const csvText = await response.text()
      const rows = this.parseCSV(csvText)
      rows.shift() // Remove header row

      const invoices = rows
        .map((row) => (row.length >= 17 ? this.transformer.transformInvoice(row) : null))
        .filter((invoice) => invoice && this.transformer.validateInvoice(invoice))

      return invoices
    } catch (error) {
      throw new Error('Failed to fetch invoices: ' + error.message)
    }
  }
}
