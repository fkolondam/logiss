import { generateMockData } from './mockdata/generators'
import { parseDate } from './mockdata/generators/dateUtils'
import { generateTestNotifications } from './mockdata/generators/notificationGenerator'

export class MockDataProvider {
  constructor() {
    // Generate initial data
    this.refreshData()

    // Cache for simulating data persistence
    this.cache = new Map()

    // Initialize notifications
    this.notifications = []
    this.notificationCheckInterval = null
    this.startNotificationChecks()
  }

  // Refresh all data using integrated generator
  refreshData() {
    // Generate correlated data for Q4 2024
    const mockData = generateMockData()

    // Store all generated data
    this.deliveries = mockData.deliveries
    this.expenses = mockData.expenses
    this.vehicles = mockData.vehicles
    this.branchData = mockData.branchData
    this.stats = mockData.stats

    // Generate initial notifications
    this.generateInitialNotifications()
  }

  // Generate initial set of notifications
  generateInitialNotifications() {
    const today = new Date()
    const notifications = generateTestNotifications(
      this.vehicles.slice(0, 5), // Use first 5 vehicles
      this.deliveries.slice(0, 10), // Use first 10 deliveries
      today,
    )
    this.notifications = notifications.map((notification) => ({
      ...notification,
      read: false,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }))
  }

  // Start periodic notification checks
  startNotificationChecks() {
    // Clear existing interval if any
    if (this.notificationCheckInterval) {
      clearInterval(this.notificationCheckInterval)
    }

    // Check for new notifications every 30 seconds
    this.notificationCheckInterval = setInterval(() => {
      const randomVehicles = this.vehicles.sort(() => 0.5 - Math.random()).slice(0, 2)

      const randomDeliveries = this.deliveries.sort(() => 0.5 - Math.random()).slice(0, 2)

      const newNotifications = generateTestNotifications(
        randomVehicles,
        randomDeliveries,
        new Date(),
      )

      // Add only a subset of generated notifications (30% chance for each)
      newNotifications.forEach((notification) => {
        if (Math.random() < 0.3) {
          this.notifications.unshift({
            ...notification,
            read: false,
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          })
        }
      })

      // Keep only last 100 notifications
      if (this.notifications.length > 100) {
        this.notifications = this.notifications.slice(0, 100)
      }
    }, 30000) // 30 seconds
  }

  async fetch(resource, params = {}) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    switch (resource) {
      case 'deliveries':
        return this.handleDeliveries(params)
      case 'expenses':
        return this.handleExpenses(params)
      case 'vehicles':
        return this.handleVehicles(params)
      case 'stats':
        return this.handleStats(params)
      case 'notifications':
        return this.handleNotifications(params)
      default:
        throw new Error(`Unknown resource: ${resource}`)
    }
  }

  handleNotifications({ limit = 50, unreadOnly = false, markAsRead = false } = {}) {
    let result = [...this.notifications]

    // Filter unread if requested
    if (unreadOnly) {
      result = result.filter((n) => !n.read)
    }

    // Mark notifications as read if requested
    if (markAsRead) {
      result.forEach((notification) => {
        const original = this.notifications.find((n) => n.id === notification.id)
        if (original) {
          original.read = true
        }
      })
    }

    // Apply limit
    if (limit) {
      result = result.slice(0, limit)
    }

    return result
  }

  // Mark specific notification as read
  markNotificationAsRead(id) {
    const notification = this.notifications.find((n) => n.id === id)
    if (notification) {
      notification.read = true
      return true
    }
    return false
  }

  // Mark all notifications as read
  markAllNotificationsAsRead() {
    this.notifications.forEach((notification) => {
      notification.read = true
    })
    return true
  }

  async getExpenseStats(params = {}) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const { dateRange } = params
    let expenses = [...this.expenses]

    if (dateRange) {
      expenses = expenses.filter((expense) => {
        const expenseDate = parseDate(expense.date)
        return expenseDate >= dateRange.start && expenseDate <= dateRange.end
      })
    }

    // Calculate stats
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const byCategory = expenses.reduce((acc, exp) => {
      if (!acc[exp.category]) {
        acc[exp.category] = { total: 0, count: 0 }
      }
      acc[exp.category].total += exp.amount
      acc[exp.category].count++
      return acc
    }, {})

    // Calculate previous period for comparison
    const previousStart = new Date(dateRange.start)
    previousStart.setMonth(previousStart.getMonth() - 1)
    const previousEnd = new Date(dateRange.end)
    previousEnd.setMonth(previousEnd.getMonth() - 1)

    const previousExpenses = this.expenses.filter((expense) => {
      const expenseDate = parseDate(expense.date)
      return expenseDate >= previousStart && expenseDate <= previousEnd
    })

    const previousTotal = previousExpenses.reduce((sum, exp) => sum + exp.amount, 0)

    return {
      total,
      count: expenses.length,
      byCategory,
      previousTotal,
    }
  }

  async getDeliveryStats(params = {}) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const { dateRange } = params
    let deliveries = [...this.deliveries]

    if (dateRange) {
      deliveries = deliveries.filter((delivery) => {
        const deliveryDate = parseDate(delivery.date)
        return deliveryDate >= dateRange.start && deliveryDate <= dateRange.end
      })
    }

    // Calculate stats
    const total = deliveries.length
    const completed = deliveries.filter((d) => d.status === 'DITERIMA - SEMUA').length
    const partial = deliveries.filter((d) => d.status === 'DITERIMA - SEBAGIAN').length
    const pending = deliveries.filter((d) => d.status === 'KIRIM ULANG').length
    const cancelled = deliveries.filter((d) => d.status.startsWith('BATAL')).length

    const successRate = total ? Math.round(((completed + partial) / total) * 100) : 0

    return {
      total,
      completed,
      partial,
      pending,
      cancelled,
      successRate,
    }
  }

  handleDeliveries({ filters = {}, sort, limit, page, perPage, search } = {}) {
    let result = [...this.deliveries]

    // Apply filters
    if (filters.status) {
      result = result.filter((d) => d.status === filters.status)
    }
    if (filters.vehicleId) {
      result = result.filter((d) => d.vehicleId === filters.vehicleId)
    }
    if (filters.dateRange) {
      result = result.filter((d) => {
        const date = parseDate(d.date)
        return date >= filters.dateRange.start && date <= filters.dateRange.end
      })
    }

    // Apply search
    if (search) {
      const searchTerm = search.toLowerCase()
      result = result.filter((d) =>
        Object.values(d).some(
          (value) => typeof value === 'string' && value.toLowerCase().includes(searchTerm),
        ),
      )
    }

    // Apply sorting
    if (sort) {
      const [field, order] = sort.split(',')
      result.sort((a, b) => {
        if (field === 'date') {
          const dateA = parseDate(a.date)
          const dateB = parseDate(b.date)
          return order === 'desc' ? dateB - dateA : dateA - dateB
        }
        if (order === 'desc') {
          return b[field] > a[field] ? 1 : -1
        }
        return a[field] > b[field] ? 1 : -1
      })
    }

    // Apply pagination
    if (page && perPage) {
      const start = (page - 1) * perPage
      result = result.slice(start, start + perPage)
    }
    // Apply limit
    else if (limit) {
      result = result.slice(0, limit)
    }

    return result
  }

  handleExpenses({ filters = {}, sort, limit, page, perPage, search } = {}) {
    let result = [...this.expenses]

    // Apply filters
    if (filters.category) {
      result = result.filter((e) => e.category === filters.category)
    }
    if (filters.dateRange) {
      result = result.filter((e) => {
        const date = parseDate(e.date)
        return date >= filters.dateRange.start && date <= filters.dateRange.end
      })
    }

    // Apply search
    if (search) {
      const searchTerm = search.toLowerCase()
      result = result.filter((e) =>
        Object.values(e).some(
          (value) => typeof value === 'string' && value.toLowerCase().includes(searchTerm),
        ),
      )
    }

    // Apply sorting
    if (sort) {
      const [field, order] = sort.split(',')
      result.sort((a, b) => {
        if (field === 'date') {
          const dateA = parseDate(a.date)
          const dateB = parseDate(b.date)
          return order === 'desc' ? dateB - dateA : dateA - dateB
        }
        if (order === 'desc') {
          return b[field] > a[field] ? 1 : -1
        }
        return a[field] > b[field] ? 1 : -1
      })
    }

    // Apply pagination
    if (page && perPage) {
      const start = (page - 1) * perPage
      result = result.slice(start, start + perPage)
    }
    // Apply limit
    else if (limit) {
      result = result.slice(0, limit)
    }

    return result
  }

  handleVehicles({ filters = {}, sort, limit, page, perPage, search } = {}) {
    let result = [...this.vehicles]

    // Apply filters
    if (filters.status) {
      result = result.filter((v) => v.status === filters.status)
    }
    if (filters.type) {
      result = result.filter((v) => v.type === filters.type)
    }

    // Apply search
    if (search) {
      const searchTerm = search.toLowerCase()
      result = result.filter((v) =>
        Object.values(v).some(
          (value) => typeof value === 'string' && value.toLowerCase().includes(searchTerm),
        ),
      )
    }

    // Apply sorting
    if (sort) {
      const [field, order] = sort.split(',')
      result.sort((a, b) => {
        if (order === 'desc') {
          return b[field] > a[field] ? 1 : -1
        }
        return a[field] > b[field] ? 1 : -1
      })
    }

    // Apply pagination
    if (page && perPage) {
      const start = (page - 1) * perPage
      result = result.slice(start, start + perPage)
    }
    // Apply limit
    else if (limit) {
      result = result.slice(0, limit)
    }

    return result
  }

  handleStats({ type } = {}) {
    if (type) {
      return this.stats[type]
    }
    return this.stats
  }

  // Method to refresh data
  async refresh() {
    // Regenerate all data
    this.refreshData()

    // Clear cache
    this.cache.clear()

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return true
  }

  // Export methods
  async exportDeliveries(data, format = 'excel') {
    const deliveries = data.length ? data : this.deliveries
    // Simulate export delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return {
      data: deliveries,
      format,
      timestamp: new Date().toISOString(),
    }
  }

  async exportExpenses(data, format = 'excel') {
    const expenses = data.length ? data : this.expenses
    // Simulate export delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return {
      data: expenses,
      format,
      timestamp: new Date().toISOString(),
    }
  }

  async exportVehicleStatus(data, format = 'excel') {
    const vehicles = data.length ? data : this.vehicles
    // Simulate export delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return {
      data: vehicles,
      format,
      timestamp: new Date().toISOString(),
    }
  }

  // Cleanup method
  destroy() {
    if (this.notificationCheckInterval) {
      clearInterval(this.notificationCheckInterval)
      this.notificationCheckInterval = null
    }
  }
}
