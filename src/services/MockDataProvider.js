import { BaseDataProvider } from './BaseDataProvider'
import { deliveriesMockData } from './mockdata/deliveries'
import { expensesMockData } from './mockdata/expenses'
import { vehiclesMockData } from './mockdata/vehicles'

const mockData = {
  deliveries: deliveriesMockData,
  expenses: expensesMockData,
  vehicles: vehiclesMockData
}

export class MockDataProvider extends BaseDataProvider {
  async fetch(resource, params = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let data = mockData[resource] || []
        
        // Handle filtering
        if (params.filter) {
          Object.keys(params.filter).forEach(key => {
            data = data.filter(item => item[key] === params.filter[key])
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
        
        // Handle search by customer or location
        if (params.search) {
          const searchLower = params.search.toLowerCase()
          data = data.filter(item => 
            item.customer?.toLowerCase().includes(searchLower) ||
            item.location?.toLowerCase().includes(searchLower)
          )
        }

        // Handle date range filtering
        if (params.dateRange) {
          const { start, end } = params.dateRange
          data = data.filter(item => {
            // Parse date in MM/DD/YY format
            const [month, day, year] = item.date.split('/')
            const itemDate = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day))
            return itemDate >= new Date(start) && itemDate <= new Date(end)
          })
        }

        // Handle status filtering
        if (params.status) {
          data = data.filter(item => item.status === params.status)
        }

        // Handle branch filtering
        if (params.branch) {
          data = data.filter(item => item.branch === params.branch)
        }

        resolve(data)
      }, 1000) // Simulate network delay
    })
  }

  async create(resource, data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newId = Math.max(...mockData[resource].map(item => item.id)) + 1
        const newItem = { 
          ...data, 
          id: newId,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString()
        }
        mockData[resource].push(newItem)
        resolve(newItem)
      }, 1000)
    })
  }

  async update(resource, id, data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockData[resource].findIndex(item => item.id === id)
        if (index !== -1) {
          mockData[resource][index] = { ...mockData[resource][index], ...data }
          resolve(mockData[resource][index])
        }
        resolve(null)
      }, 1000)
    })
  }

  async delete(resource, id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockData[resource].findIndex(item => item.id === id)
        if (index !== -1) {
          mockData[resource].splice(index, 1)
          resolve(true)
        }
        resolve(false)
      }, 1000)
    })
  }

  // Additional helper methods for specific functionality
  async getDeliveryStats(params = {}) {
    const deliveries = await this.fetch('deliveries', params)
    
    // Count deliveries by status
    const statusCounts = deliveries.reduce((acc, d) => {
      if (d.status === 'DITERIMA - SEMUA' || d.status === 'DITERIMA - SEBAGIAN') {
        acc.completed = (acc.completed || 0) + 1
      } else if (d.status === 'KIRIM ULANG') {
        acc.pending = (acc.pending || 0) + 1
      } else if (d.status.startsWith('BATAL')) {
        acc.cancelled = (acc.cancelled || 0) + 1
      }
      return acc
    }, {})

    return {
      total: deliveries.length,
      completed: statusCounts.completed || 0,
      pending: statusCounts.pending || 0,
      cancelled: statusCounts.cancelled || 0
    }
  }

  async getExpenseStats(params = {}) {
    const expenses = await this.fetch('expenses', params)
    
    // Get previous period data for trend comparison
    let previousTotal = 0
    if (params.dateRange) {
      const { start, end } = params.dateRange
      const currentPeriodDays = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24))
      const previousStart = new Date(new Date(start).getTime() - currentPeriodDays * 24 * 60 * 60 * 1000)
      const previousEnd = new Date(start)

      const previousExpenses = await this.fetch('expenses', {
        ...params,
        dateRange: { start: previousStart, end: previousEnd }
      })
      previousTotal = previousExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    }

    return {
      total: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      count: expenses.length,
      byCategory: expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount
        return acc
      }, {}),
      previousTotal
    }
  }

  async getVehicleStats(params = {}) {
    const vehicles = await this.fetch('vehicles', params)
    return {
      total: vehicles.length,
      active: vehicles.filter(v => v.status === 'active').length,
      maintenance: vehicles.filter(v => v.status === 'maintenance').length
    }
  }
}
