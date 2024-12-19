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

  async fetch(resource, options = {}) {
    const data = this.data[resource]
    if (!data) {
      throw new Error(`Resource ${resource} not found`)
    }

    // Sort if requested
    if (options.sort) {
      const [field, direction] = options.sort.split(',')
      const sorted = [...data].sort((a, b) => {
        if (direction === 'desc') {
          return b[field] > a[field] ? 1 : -1
        }
        return a[field] > b[field] ? 1 : -1
      })
      return sorted.slice(0, options.limit || sorted.length)
    }

    // Return data with limit if specified
    return options.limit ? data.slice(0, options.limit) : data
  }

  async getExpenseStats({ dateRange }) {
    const expenses = this.data.expenses
    if (!expenses) return null

    // Filter expenses by date range
    const filtered = expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate >= dateRange.start && expenseDate <= dateRange.end
    })

    // Calculate totals
    const total = filtered.reduce((sum, expense) => sum + expense.amount, 0)
    const count = filtered.length

    // Group by category
    const byCategory = filtered.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {})

    // Get previous period stats for comparison
    const previousStart = new Date(dateRange.start)
    previousStart.setDate(previousStart.getDate() - (dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24))
    const previousEnd = new Date(dateRange.start)
    previousEnd.setDate(previousEnd.getDate() - 1)

    const previousFiltered = expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate >= previousStart && expenseDate <= previousEnd
    })

    const previousTotal = previousFiltered.reduce((sum, expense) => sum + expense.amount, 0)

    return {
      total,
      count,
      byCategory,
      previousTotal
    }
  }
}
