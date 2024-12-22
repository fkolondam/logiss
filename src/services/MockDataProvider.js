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

        // Apply scope-based filters first
        if (params.scope) {
          switch (params.scope.type) {
            case 'region':
              data = data.filter((item) => item.region === params.scope.value)
              break
            case 'branch':
              data = data.filter((item) => item.branch === params.scope.value)
              break
            case 'personal':
              data = data.filter((item) => {
                return (
                  item.userId === params.scope.value ||
                  item.driverId === params.scope.value ||
                  item.assignedTo === params.scope.value ||
                  item.driver === params.scope.value ||
                  item.assignedDriverId === params.scope.value
                )
              })
              break
          }
        }

        // Apply other filters after scope filtering
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

        // Handle search
        if (params.search) {
          const searchLower = params.search.toLowerCase()
          data = data.filter(
            (item) =>
              item.customer?.toLowerCase().includes(searchLower) ||
              item.location?.toLowerCase().includes(searchLower) ||
              item.invoice?.toLowerCase().includes(searchLower),
          )
        }

        // Handle date range
        if (params.dateRange) {
          const { start, end } = params.dateRange
          const startDate = new Date(start)
          const endDate = new Date(end)
          startDate.setHours(0, 0, 0, 0)
          endDate.setHours(23, 59, 59, 999)

          data = data.filter((item) => {
            const itemDate = new Date(item.date)
            itemDate.setHours(0, 0, 0, 0)
            return itemDate >= startDate && itemDate <= endDate
          })

          console.log('Date filtering:', {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            filtered: data.length,
          })
        }

        // Handle multiple status filtering
        if (params.status) {
          const statuses = Array.isArray(params.status) ? params.status : [params.status]
          data = data.filter((item) => statuses.includes(item.status))
        }

        // Handle vehicle filtering
        if (params.vehicle) {
          data = data.filter((item) => item.vehicleNumber === params.vehicle)
        }

        // Handle payment method filtering
        if (params.paymentMethod) {
          data = data.filter((item) => item.paymentMethod === params.paymentMethod)
        }

        // Log filtered results
        console.log(`MockDataProvider: Filtered ${resource} data`, {
          total: mockData[resource]?.length || 0,
          filtered: data.length,
          params,
        })

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
    // Use provided data if available, otherwise fetch
    const deliveries = params.data || (await this.fetch('deliveries', params)).data

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
    const byBranch = deliveries.reduce((acc, d) => {
      if (!acc[d.branch]) {
        acc[d.branch] = { total: 0, active: 0, maintenance: 0 }
      }
      acc[d.branch].total++
      return acc
    }, {})

    return {
      total: deliveries.length,
      totalAmount,
      byStatus: statusCounts,
      byPaymentMethod: paymentMethodStats,
      byBranch,
      // Include raw data for scope filtering
      data: deliveries,
    }
  }

  async getExpenseStats(params = {}) {
    // Use provided data if available, otherwise fetch
    const expenses = params.data || (await this.fetch('expenses', params)).data

    // Initialize all expense categories with 0 values
    const stats = {
      totalAmount: 0,
      byCategory: {
        Fuel: { count: 0, amount: 0 },
        Maintenance: { count: 0, amount: 0 },
        'Vehicle License': { count: 0, amount: 0 },
        Labour: { count: 0, amount: 0 },
        'Parking-Tol-Retribution': { count: 0, amount: 0 },
      },
    }

    // Calculate totals and group by category
    expenses.forEach((exp) => {
      if (exp.category && stats.byCategory[exp.category]) {
        stats.byCategory[exp.category].count++
        stats.byCategory[exp.category].amount += exp.amount || 0
        stats.totalAmount += exp.amount || 0
      }
    })

    // Calculate trends for each category
    Object.entries(stats.byCategory).forEach(([category, data]) => {
      const previousAmount = Math.round(data.amount * 1.1) // Previous period had 10% more expenses
      const trend = Math.round(((data.amount - previousAmount) / previousAmount) * 100)
      stats.byCategory[category].trend = trend
    })

    // Calculate overall trend
    const previousTotal = Math.round(stats.totalAmount * 1.1) // Previous period had 10% more total expenses
    stats.trend = Math.round(((stats.totalAmount - previousTotal) / previousTotal) * 100)

    return {
      total: expenses.length,
      ...stats,
      // Include raw data for scope filtering
      data: expenses,
    }
  }

  async getVehicleStats(params = {}) {
    // Use provided data if available, otherwise fetch
    const vehicles = params.data || (await this.fetch('vehicles', params)).data

    // Count by status
    const statusCounts = vehicles.reduce((acc, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1
      return acc
    }, {})

    // Count vehicles with low fuel
    const lowFuelCount = vehicles.filter((v) => v.fuelLevel <= 30).length

    // Group by branch
    const byBranch = vehicles.reduce((acc, v) => {
      if (!acc[v.branch]) {
        acc[v.branch] = { total: 0, active: 0, maintenance: 0 }
      }
      acc[v.branch].total++
      acc[v.branch][v.status]++
      return acc
    }, {})

    // Calculate trends (simulate with random values for now)
    const utilizationTrend = Math.round(Math.random() * 20 - 10) // -10 to +10
    const maintenanceTrend = Math.round(Math.random() * 20 - 10) // -10 to +10
    const activeTrend = Math.round(Math.random() * 20 - 10) // -10 to +10
    const fuelTrend = Math.round(Math.random() * 20 - 10) // -10 to +10

    // Count expiring documents and service due
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.setDate(today.getDate() + 30))
    const expiringDocs = vehicles.filter((v) => {
      const insuranceExpiry = new Date(v.documents.insurance.expiry)
      const registrationExpiry = new Date(v.documents.registration.expiry)
      return insuranceExpiry <= thirtyDaysFromNow || registrationExpiry <= thirtyDaysFromNow
    }).length

    const serviceDue = vehicles.filter((v) => {
      const nextService = new Date(v.nextServiceDue)
      return nextService <= thirtyDaysFromNow
    }).length

    // Get next expiry dates
    const nextDocExpiry = vehicles.reduce((earliest, v) => {
      const insuranceExpiry = new Date(v.documents.insurance.expiry)
      const registrationExpiry = new Date(v.documents.registration.expiry)
      const nextExpiry = insuranceExpiry < registrationExpiry ? insuranceExpiry : registrationExpiry
      return !earliest || nextExpiry < earliest ? nextExpiry : earliest
    }, null)

    const nextServiceDue = vehicles.reduce((earliest, v) => {
      const serviceDate = new Date(v.nextServiceDue)
      return !earliest || serviceDate < earliest ? serviceDate : earliest
    }, null)

    return {
      total: vehicles.length,
      active: statusCounts.active || 0,
      maintenance: statusCounts.maintenance || 0,
      lowFuel: lowFuelCount,
      expiringDocs,
      serviceDue,
      nextDocExpiry: nextDocExpiry?.toISOString().split('T')[0],
      nextServiceDue: nextServiceDue?.toISOString().split('T')[0],
      utilizationTrend,
      maintenanceTrend,
      activeTrend,
      fuelTrend,
      byBranch,
      // Include raw data for scope filtering
      data: vehicles,
    }
  }
}
