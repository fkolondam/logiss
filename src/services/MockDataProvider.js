import { BaseDataProvider } from './BaseDataProvider.js'
import { deliveriesMockData, expensesMockData, vehiclesMockData } from './mockdata/index.js'

const mockData = {
  deliveries: deliveriesMockData,
  expenses: expensesMockData,
  vehicles: vehiclesMockData,
}

export class MockDataProvider extends BaseDataProvider {
  async fetch(resource, params = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let data = mockData[resource] || []

        // Handle filtering
        if (params.filter) {
          Object.keys(params.filter).forEach((key) => {
            data = data.filter((item) => item[key] === params.filter[key])
          })
        }

        // Handle sorting
        if (params.sort) {
          const [field, order] = params.sort.split(',')
          data = [...data].sort((a, b) => {
            if (order === 'desc') {
              return b[field] > a[field] ? 1 : -1
            }
            return a[field] > b[field] ? 1 : -1
          })
        }

        // Handle pagination
        if (params.page && params.limit) {
          const start = (params.page - 1) * params.limit
          data = data.slice(start, start + params.limit)
        }

        // Handle search by customer, location, or invoice
        if (params.search) {
          const searchLower = params.search.toLowerCase()
          data = data.filter(
            (item) =>
              item.customer?.toLowerCase().includes(searchLower) ||
              item.location?.toLowerCase().includes(searchLower) ||
              item.invoice?.toLowerCase().includes(searchLower),
          )
        }

        // Handle date range filtering with proper date parsing
        if (params.dateRange) {
          const { start, end } = params.dateRange
          data = data.filter((item) => {
            const itemDate = new Date(item.date)
            return itemDate >= new Date(start) && itemDate <= new Date(end)
          })
        }

        // Handle multiple status filtering
        if (params.status) {
          const statuses = Array.isArray(params.status) ? params.status : [params.status]
          data = data.filter((item) => statuses.includes(item.status))
        }

        // Handle multiple branch filtering
        if (params.branch) {
          const branches = Array.isArray(params.branch) ? params.branch : [params.branch]
          data = data.filter((item) => branches.includes(item.branch))
        }

        // Handle region filtering
        if (params.region) {
          data = data.filter((item) => item.region === params.region)
        }

        // Handle vehicle filtering
        if (params.vehicle) {
          data = data.filter((item) => item.vehicleNumber === params.vehicle)
        }

        // Handle payment method filtering
        if (params.paymentMethod) {
          data = data.filter((item) => item.paymentMethod === params.paymentMethod)
        }

        resolve({
          data,
          total: data.length,
          page: params.page || 1,
          limit: params.limit || data.length,
        })
      }, 300) // Reduced delay for better responsiveness
    })
  }

  async create(resource, data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newId = Math.max(...mockData[resource].map((item) => item.id)) + 1
        const newItem = {
          ...data,
          id: newId,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString(),
        }
        mockData[resource].push(newItem)
        resolve(newItem)
      }, 300)
    })
  }

  async update(resource, id, data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockData[resource].findIndex((item) => item.id === id)
        if (index !== -1) {
          mockData[resource][index] = { ...mockData[resource][index], ...data }
          resolve(mockData[resource][index])
        }
        resolve(null)
      }, 300)
    })
  }

  async delete(resource, id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockData[resource].findIndex((item) => item.id === id)
        if (index !== -1) {
          mockData[resource].splice(index, 1)
          resolve(true)
        }
        resolve(false)
      }, 300)
    })
  }

  async getDeliveryStats(params = {}) {
    const { data: deliveries } = await this.fetch('deliveries', params)

    // Calculate total amount
    const totalAmount = deliveries.reduce((sum, d) => sum + d.amount, 0)

    // Count deliveries by status
    const statusCounts = deliveries.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1
      return acc
    }, {})

    // Group by payment method
    const paymentMethodStats = deliveries.reduce((acc, d) => {
      if (!acc[d.paymentMethod]) {
        acc[d.paymentMethod] = { count: 0, amount: 0 }
      }
      acc[d.paymentMethod].count++
      acc[d.paymentMethod].amount += d.amount
      return acc
    }, {})

    // Group by branch
    const branchStats = deliveries.reduce((acc, d) => {
      if (!acc[d.branch]) {
        acc[d.branch] = { count: 0, amount: 0 }
      }
      acc[d.branch].count++
      acc[d.branch].amount += d.amount
      return acc
    }, {})

    return {
      total: deliveries.length,
      totalAmount,
      byStatus: statusCounts,
      byPaymentMethod: paymentMethodStats,
      byBranch: branchStats,
    }
  }

  async getExpenseStats(params = {}) {
    const { data: expenses } = await this.fetch('expenses', params)

    // Calculate totals and group by category
    const stats = expenses.reduce(
      (acc, exp) => {
        if (!acc.byCategory[exp.category]) {
          acc.byCategory[exp.category] = { count: 0, amount: 0 }
        }
        acc.byCategory[exp.category].count++
        acc.byCategory[exp.category].amount += exp.amount
        acc.totalAmount += exp.amount
        return acc
      },
      { totalAmount: 0, byCategory: {} },
    )

    return {
      total: expenses.length,
      ...stats,
    }
  }

  async getVehicleStats(params = {}) {
    const { data: vehicles } = await this.fetch('vehicles', params)

    // Group by branch
    const byBranch = vehicles.reduce((acc, v) => {
      if (!acc[v.branch]) {
        acc[v.branch] = { total: 0, active: 0, maintenance: 0 }
      }
      acc[v.branch].total++
      acc[v.branch][v.status]++
      return acc
    }, {})

    return {
      total: vehicles.length,
      byBranch,
    }
  }
}
