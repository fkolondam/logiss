import { generateMockData } from './mockdata/generators'
import { parseDate, formatDate, startOfMonth, endOfMonth } from './mockdata/generators/dateUtils'
import { generateTestNotifications } from './mockdata/generators/notificationGenerator'
import { DataProviderError } from './errors/DataProviderError'

export class MockDataProvider {
  constructor() {
    // Initialize data
    this.deliveries = []
    this.currentStats = {
      total: 0,
      completed: 0,
      partial: 0,
      pending: 0,
      cancelled: 0,
      successRate: 0,
    }
    this.previousStats = {
      total: 0,
      completed: 0,
      partial: 0,
      pending: 0,
      cancelled: 0,
      successRate: 0,
    }
    this.expenses = []
    this.vehicles = []
    this.branchData = {}
    this.stats = {}
    this.cache = new Map()
    this.notifications = []
    this.notificationCheckInterval = null

    // Generate initial data
    this.refreshData()
    this.startNotificationChecks()
  }

  // Refresh all data using integrated generator
  refreshData() {
    try {
      console.log('Refreshing mock data...')
      // Generate correlated data for Q4 2024
      const mockData = generateMockData()

      if (!mockData?.success) {
        console.error('Failed to generate mock data:', mockData?.error)
        return false
      }

      // Store all generated data
      const { data } = mockData
      if (!data) {
        console.error('No data received from generator')
        return false
      }

      // Update deliveries data
      if (data.deliveries?.deliveries) {
        this.deliveries = data.deliveries.deliveries
        this.currentStats = data.deliveries.currentStats || this.currentStats
        this.previousStats = data.deliveries.previousStats || this.previousStats
      }

      // Update other data
      this.expenses = data.expenses || this.expenses
      this.vehicles = data.vehicles || this.vehicles
      this.branchData = data.branchData || this.branchData
      this.stats = data.stats || this.stats

      // Generate initial notifications if we have data
      if (this.vehicles.length && this.deliveries.length) {
        this.generateInitialNotifications()
      }

      console.log('Mock data refreshed successfully')
      return true
    } catch (error) {
      console.error('Error refreshing mock data:', error)
      return false
    }
  }

  // Generate initial set of notifications
  generateInitialNotifications() {
    try {
      console.log('Generating initial notifications...')
      const today = new Date()
      const vehicleSample = this.vehicles.slice(0, 5)
      const deliverySample = this.deliveries.slice(0, 10)

      const notifications = generateTestNotifications(vehicleSample, deliverySample, today)
      this.notifications = notifications.map((notification) => ({
        ...notification,
        read: false,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }))
      console.log('Generated', this.notifications.length, 'notifications')
    } catch (error) {
      console.error('Error generating notifications:', error)
    }
  }

  // Start periodic notification checks
  startNotificationChecks() {
    if (this.notificationCheckInterval) {
      clearInterval(this.notificationCheckInterval)
    }

    this.notificationCheckInterval = setInterval(() => {
      try {
        if (!this.vehicles?.length || !this.deliveries?.length) return

        const randomVehicles = [...this.vehicles].sort(() => 0.5 - Math.random()).slice(0, 2)
        const randomDeliveries = [...this.deliveries].sort(() => 0.5 - Math.random()).slice(0, 2)
        const newNotifications = generateTestNotifications(
          randomVehicles,
          randomDeliveries,
          new Date(),
        )

        newNotifications.forEach((notification) => {
          if (Math.random() < 0.3) {
            this.notifications.unshift({
              ...notification,
              read: false,
              id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            })
          }
        })

        if (this.notifications.length > 100) {
          this.notifications = this.notifications.slice(0, 100)
        }
      } catch (error) {
        console.error('Error in notification check:', error)
      }
    }, 30000)
  }

  async fetch(resource, params = {}) {
    try {
      if (!['deliveries', 'expenses', 'vehicles', 'stats', 'notifications'].includes(resource)) {
        throw DataProviderError.createError('INVALID_RESOURCE', `Unknown resource: ${resource}`)
      }

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Ensure data is loaded
      if (!this.vehicles?.length || !this.deliveries?.length || !this.expenses?.length) {
        await this.refreshData()
      }

      const handlers = {
        deliveries: () => this.handleDeliveries(params),
        expenses: () => this.handleExpenses(params),
        vehicles: () => this.handleVehicles(params),
        stats: () => this.handleStats(params),
        notifications: () => this.handleNotifications(params),
      }

      const result = await handlers[resource]()
      if (result === undefined || result === null) {
        throw DataProviderError.createError('DATA_NOT_FOUND', `No data found for ${resource}`)
      }

      return { data: result, timestamp: new Date().toISOString(), success: true }
    } catch (error) {
      console.error('Error in fetch:', error)
      if (error instanceof DataProviderError) throw error
      throw DataProviderError.createError('FETCH_ERROR', error.message)
    }
  }

  handleNotifications({ limit = 50, unreadOnly = false, markAsRead = false } = {}) {
    let result = [...this.notifications]
    if (unreadOnly) result = result.filter((n) => !n.read)
    if (markAsRead) {
      result.forEach((notification) => {
        const original = this.notifications.find((n) => n.id === notification.id)
        if (original) original.read = true
      })
    }
    if (limit) result = result.slice(0, limit)
    return result
  }

  markNotificationAsRead(id) {
    const notification = this.notifications.find((n) => n.id === id)
    if (notification) {
      notification.read = true
      return true
    }
    return false
  }

  markAllNotificationsAsRead() {
    this.notifications.forEach((notification) => (notification.read = true))
    return true
  }

  async getExpenseStats(params = {}) {
    if (!params.dateRange?.start || !params.dateRange?.end) {
      throw DataProviderError.createError(
        'INVALID_PARAMS',
        'Date range is required for expense stats',
      )
    }

    // Ensure data is loaded
    if (!this.expenses?.length) {
      await this.refreshData()
    }

    const { dateRange } = params
    const startDate = parseDate(dateRange.start)
    const endDate = parseDate(dateRange.end)

    if (!startDate || !endDate) {
      throw DataProviderError.createError('INVALID_PARAMS', 'Invalid date range format')
    }

    const expenses =
      this.expenses?.filter((expense) => {
        const expenseDate = parseDate(expense.date)
        return expenseDate && expenseDate >= startDate && expenseDate <= endDate
      }) || []

    const total = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
    const byCategory = expenses.reduce((acc, exp) => {
      if (!acc[exp.category]) acc[exp.category] = 0
      acc[exp.category] += exp.amount || 0
      return acc
    }, {})

    const previousStart = startOfMonth(startDate)
    previousStart.setMonth(previousStart.getMonth() - 1)
    const previousEnd = endOfMonth(previousStart)

    const previousExpenses =
      this.expenses?.filter((expense) => {
        const expenseDate = parseDate(expense.date)
        return expenseDate && expenseDate >= previousStart && expenseDate <= previousEnd
      }) || []

    const previousTotal = previousExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)

    return {
      data: { total, count: expenses.length, byCategory, previousTotal },
      timestamp: new Date().toISOString(),
      success: true,
    }
  }

  handleDeliveries({ filters = {}, sort, limit, page, perPage, search } = {}) {
    let result = [...(this.deliveries || [])]

    if (filters.status) result = result.filter((d) => d.status === filters.status)
    if (filters.vehicleId) result = result.filter((d) => d.vehicleId === filters.vehicleId)
    if (filters.dateRange) {
      const startDate = parseDate(filters.dateRange.start)
      const endDate = parseDate(filters.dateRange.end)
      if (startDate && endDate) {
        result = result.filter((d) => {
          const date = parseDate(d.date)
          return date && date >= startDate && date <= endDate
        })
      }
    }

    if (search) {
      const searchTerm = search.toLowerCase()
      result = result.filter((d) =>
        Object.values(d).some(
          (value) => typeof value === 'string' && value.toLowerCase().includes(searchTerm),
        ),
      )
    }

    if (sort) {
      const [field, order] = sort.split(',')
      result.sort((a, b) => {
        if (field === 'date') {
          const dateA = parseDate(a.date)
          const dateB = parseDate(b.date)
          if (dateA && dateB) {
            return order === 'desc' ? dateB - dateA : dateA - dateB
          }
          return 0
        }
        return order === 'desc' ? (b[field] > a[field] ? 1 : -1) : a[field] > b[field] ? 1 : -1
      })
    }

    if (page && perPage) {
      const start = (page - 1) * perPage
      result = result.slice(start, start + perPage)
    } else if (limit) {
      result = result.slice(0, limit)
    }

    return result
  }

  handleExpenses({ filters = {}, sort, limit, page, perPage, search } = {}) {
    let result = [...(this.expenses || [])]

    if (filters.category) result = result.filter((e) => e.category === filters.category)
    if (filters.dateRange) {
      const startDate = parseDate(filters.dateRange.start)
      const endDate = parseDate(filters.dateRange.end)
      if (startDate && endDate) {
        result = result.filter((e) => {
          const date = parseDate(e.date)
          return date && date >= startDate && date <= endDate
        })
      }
    }

    if (search) {
      const searchTerm = search.toLowerCase()
      result = result.filter((e) =>
        Object.values(e).some(
          (value) => typeof value === 'string' && value.toLowerCase().includes(searchTerm),
        ),
      )
    }

    if (sort) {
      const [field, order] = sort.split(',')
      result.sort((a, b) => {
        if (field === 'date') {
          const dateA = parseDate(a.date)
          const dateB = parseDate(b.date)
          if (dateA && dateB) {
            return order === 'desc' ? dateB - dateA : dateA - dateB
          }
          return 0
        }
        return order === 'desc' ? (b[field] > a[field] ? 1 : -1) : a[field] > b[field] ? 1 : -1
      })
    }

    if (page && perPage) {
      const start = (page - 1) * perPage
      result = result.slice(start, start + perPage)
    } else if (limit) {
      result = result.slice(0, limit)
    }

    return result
  }

  handleVehicles({ filters = {}, sort, limit, page, perPage, search } = {}) {
    let result = [...(this.vehicles || [])]

    if (filters.status) result = result.filter((v) => v.status === filters.status)
    if (filters.type) result = result.filter((v) => v.type === filters.type)

    if (search) {
      const searchTerm = search.toLowerCase()
      result = result.filter((v) =>
        Object.values(v).some(
          (value) => typeof value === 'string' && value.toLowerCase().includes(searchTerm),
        ),
      )
    }

    if (sort) {
      const [field, order] = sort.split(',')
      result.sort((a, b) =>
        order === 'desc' ? (b[field] > a[field] ? 1 : -1) : a[field] > b[field] ? 1 : -1,
      )
    }

    if (page && perPage) {
      const start = (page - 1) * perPage
      result = result.slice(start, start + perPage)
    } else if (limit) {
      result = result.slice(0, limit)
    }

    return result
  }

  handleStats({ type } = {}) {
    return type ? this.stats[type] : this.stats
  }

  async refresh() {
    const success = this.refreshData()
    if (success) {
      this.cache.clear()
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return { success: true, timestamp: new Date().toISOString() }
    }
    return { success: false, error: 'Failed to refresh data', timestamp: new Date().toISOString() }
  }

  async exportDeliveries(data, format = 'excel') {
    const deliveries = data?.length ? data : this.deliveries
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return { data: deliveries, format, timestamp: new Date().toISOString(), success: true }
  }

  async exportExpenses(data, format = 'excel') {
    const expenses = data?.length ? data : this.expenses
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return { data: expenses, format, timestamp: new Date().toISOString(), success: true }
  }

  async exportVehicleStatus(data, format = 'excel') {
    const vehicles = data?.length ? data : this.vehicles
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return { data: vehicles, format, timestamp: new Date().toISOString(), success: true }
  }

  destroy() {
    if (this.notificationCheckInterval) {
      clearInterval(this.notificationCheckInterval)
      this.notificationCheckInterval = null
    }
  }
}
