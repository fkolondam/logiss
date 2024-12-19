import { BaseDataProvider } from './BaseDataProvider'
import { deliveriesMockData } from './mockdata/deliveries_old.js'
import { expensesMockData } from './mockdata/expenses_old.js'
import { vehiclesMockData } from './mockdata/vehicles_old.js'

export class MockDataProvider extends BaseDataProvider {
  constructor() {
    super()
    this.data = {
      deliveries: deliveriesMockData,
      expenses: expensesMockData,
      vehicles: vehiclesMockData
    }
  }

  // Helper method to normalize date to start of day
  #normalizeDate(date) {
    const normalized = new Date(date)
    normalized.setHours(0, 0, 0, 0)
    return normalized
  }

  // Helper method to get previous period range
  #getPreviousPeriodRange(dateRange) {
    if (!dateRange?.start || !dateRange?.end) {
      throw new Error('Invalid date range provided')
    }

    const start = this.#normalizeDate(dateRange.start)
    const end = this.#normalizeDate(dateRange.end)
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))

    const previousStart = new Date(start)
    previousStart.setDate(previousStart.getDate() - daysDiff)
    
    const previousEnd = new Date(start)
    previousEnd.setDate(previousEnd.getDate() - 1)

    return { start: previousStart, end: previousEnd }
  }

  // Helper method to filter by date range
  #filterByDateRange(items, dateField, dateRange) {
    const start = this.#normalizeDate(dateRange.start)
    const end = this.#normalizeDate(dateRange.end)

    return items.filter(item => {
      const itemDate = this.#normalizeDate(item[dateField])
      return itemDate >= start && itemDate <= end
    })
  }

  // Helper method to handle string comparison
  #compareStrings(a, b, direction = 'asc') {
    const aStr = String(a).toLowerCase()
    const bStr = String(b).toLowerCase()
    if (direction === 'desc') {
      return aStr > bStr ? -1 : aStr < bStr ? 1 : 0
    }
    return aStr < bStr ? -1 : aStr > bStr ? 1 : 0
  }

  // Helper method to handle date comparison
  #compareDates(a, b, direction = 'asc') {
    const aDate = new Date(a)
    const bDate = new Date(b)
    if (direction === 'desc') {
      return aDate > bDate ? -1 : aDate < bDate ? 1 : 0
    }
    return aDate < bDate ? -1 : aDate > bDate ? 1 : 0
  }

  // Helper method to handle sorting
  #sortItems(items, field, direction) {
    return [...items].sort((a, b) => {
      const aValue = a[field]
      const bValue = b[field]

      if (aValue instanceof Date || bValue instanceof Date) {
        return this.#compareDates(aValue, bValue, direction)
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.#compareStrings(aValue, bValue, direction)
      }
      if (direction === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    })
  }

  async fetch(resource, options = {}) {
    const data = this.data[resource]
    if (!data) {
      throw new Error(`Resource ${resource} not found`)
    }

    let result = [...data]

    // Apply filters if any
    if (options.filters) {
      result = result.filter(item => {
        return Object.entries(options.filters).every(([key, value]) => {
          if (Array.isArray(value)) {
            return value.includes(item[key])
          }
          if (typeof value === 'object' && value !== null) {
            if (value.start && value.end) {
              return this.#filterByDateRange([item], key, value).length > 0
            }
            return false
          }
          // Case-insensitive comparison for string values
          if (typeof item[key] === 'string' && typeof value === 'string') {
            return item[key].toLowerCase() === value.toLowerCase()
          }
          return item[key] === value
        })
      })
    }

    // Apply search if specified
    if (options.search) {
      const searchLower = options.search.toLowerCase()
      result = result.filter(item => {
        return Object.values(item).some(value => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchLower)
          }
          return false
        })
      })
    }

    // Sort if requested
    if (options.sort) {
      const [field, direction] = options.sort.split(',')
      result = this.#sortItems(result, field, direction)
    }

    // Apply pagination if requested
    if (options.page && options.perPage) {
      const start = (options.page - 1) * options.perPage
      const end = start + options.perPage
      result = result.slice(start, end)
    }
    // Apply limit if specified (without pagination)
    else if (options.limit) {
      result = result.slice(0, options.limit)
    }

    return result
  }

  async getExpenseStats({ dateRange }) {
    if (!dateRange?.start || !dateRange?.end) {
      throw new Error('Invalid date range provided')
    }

    const expenses = this.data.expenses
    if (!expenses) return null

    // Filter expenses by date range
    const filtered = this.#filterByDateRange(expenses, 'date', dateRange)

    // Calculate totals
    const total = filtered.reduce((sum, expense) => sum + expense.amount, 0)
    const count = filtered.length

    // Group by category
    const byCategory = filtered.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {})

    // Get previous period stats
    const previousRange = this.#getPreviousPeriodRange(dateRange)
    const previousFiltered = this.#filterByDateRange(expenses, 'date', previousRange)
    const previousTotal = previousFiltered.reduce((sum, expense) => sum + expense.amount, 0)

    return {
      total,
      count,
      byCategory,
      previousTotal,
      dateRange: {
        start: dateRange.start,
        end: dateRange.end
      }
    }
  }

  async getDeliveryStats({ dateRange }) {
    if (!dateRange?.start || !dateRange?.end) {
      throw new Error('Invalid date range provided')
    }

    const deliveries = this.data.deliveries
    if (!deliveries) return null

    // Filter deliveries by date range
    const filtered = this.#filterByDateRange(deliveries, 'date', dateRange)

    // Calculate stats
    const stats = filtered.reduce((acc, delivery) => {
      acc.total++
      const status = delivery.status.toLowerCase()

      if (status === 'diterima - semua') {
        acc.completed++
      } else if (status === 'diterima - sebagian') {
        acc.partial++
      } else if (status === 'kirim ulang') {
        acc.pending++
      } else if (status.includes('batal')) {
        acc.cancelled++
      }

      acc.totalAmount += delivery.amount || 0

      return acc
    }, {
      total: 0,
      completed: 0,
      partial: 0,
      pending: 0,
      cancelled: 0,
      totalAmount: 0
    })

    // Calculate success rate
    stats.successRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0

    // Get previous period stats
    const previousRange = this.#getPreviousPeriodRange(dateRange)
    const previousFiltered = this.#filterByDateRange(deliveries, 'date', previousRange)

    stats.previousTotal = previousFiltered.length
    stats.previousCompleted = previousFiltered.filter(d => 
      d.status.toLowerCase() === 'diterima - semua'
    ).length

    return stats
  }
}
