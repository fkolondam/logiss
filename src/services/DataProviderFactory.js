import { MockDataProvider } from './MockDataProvider'
import { AccessControlWrapper } from './AccessControlWrapper'
import { expenseCategoryConfig } from './mockdata/generators/branchData'

class DataProviderFactory {
  constructor() {
    this.baseProvider = new MockDataProvider()
    this.pendingRequests = new Map()
  }

  getPendingKey(resource, scope, params) {
    const scopeKey = scope ? `${scope.type}:${scope.value || 'all'}` : 'global'
    return `${resource}:${scopeKey}:${JSON.stringify(params)}`
  }

  async getData(resource, scope, params = {}) {
    console.log(`Fetching ${resource} with scope:`, scope)

    if (!this.validateScopeAccess(resource, scope)) {
      throw new Error(`Access denied: Invalid scope for resource ${resource}`)
    }

    const requestKey = this.getPendingKey(resource, scope, params)
    if (this.pendingRequests.has(requestKey)) {
      console.log(`Reusing pending request for ${requestKey}`)
      return this.pendingRequests.get(requestKey)
    }

    const requestPromise = (async () => {
      try {
        const scopedParams = { ...params }
        if (scope && scope.type !== 'global') {
          switch (scope.type) {
            case 'region':
              scopedParams.region = scope.value
              break
            case 'branch':
              scopedParams.branch = scope.value
              break
            case 'personal':
              scopedParams.userId = scope.value
              scopedParams.driverId = scope.value
              scopedParams.assignedTo = scope.value
              scopedParams.driver = scope.value
              break
          }
        }

        const result = await this.baseProvider.fetch(resource, scopedParams)
        const filteredData = AccessControlWrapper.filterByScope(result.data, scope)

        console.log(`Filtered ${resource} data:`, {
          total: result.data.length,
          filtered: filteredData.length,
          scope,
          params: scopedParams,
        })

        return {
          ...result,
          data: filteredData,
          total: filteredData.length,
        }
      } finally {
        this.pendingRequests.delete(requestKey)
      }
    })()

    this.pendingRequests.set(requestKey, requestPromise)
    return requestPromise
  }

  async getStats(resource, scope, options = {}) {
    if (!this.validateScopeAccess(resource, scope)) {
      throw new Error(`Access denied: Invalid scope for resource ${resource}`)
    }

    // Determine period based on date range
    let period = 'today'
    if (options.dateRange) {
      const { start, end } = options.dateRange
      const startDate = new Date(start)
      const endDate = new Date(end)
      const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        period = 'today'
      } else if (diffDays <= 7) {
        period = 'this_week'
      } else if (diffDays <= 31) {
        period = 'this_month'
      } else {
        period = 'custom'
      }
    }

    const requestKey = `stats:${this.getPendingKey(resource, scope, { ...options, period })}`
    if (this.pendingRequests.has(requestKey)) {
      console.log(`Reusing pending stats request for ${requestKey}`)
      return this.pendingRequests.get(requestKey)
    }

    const requestPromise = (async () => {
      try {
        const { data } = await this.getData(resource, scope, options)
        const stats = {
          total: data.length,
          totalAmount: data.reduce((sum, item) => sum + (item.amount || 0), 0),
        }

        if (resource === 'deliveries') {
          const statusMap = {
            'DITERIMA - SEMUA': 'receivedAll',
            'DITERIMA - SEBAGIAN': 'partial',
            'KIRIM ULANG': 'resend',
            'BATAL - TOKO TUTUP': 'cancelled',
            'BATAL - TIDAK ADA UANG': 'cancelled',
            'BATAL - SALAH ORDER': 'cancelled',
            'BATAL - TOKO TIDAK DAPAT DIAKSES': 'cancelled',
          }

          stats.receivedAll = 0
          stats.partial = 0
          stats.resend = 0
          stats.cancelled = 0

          data.forEach((item) => {
            const mappedStatus = statusMap[item.status]
            if (mappedStatus) {
              stats[mappedStatus]++
            }
          })

          const previousTotal = Math.round(data.length * 1.1)
          const previousReceived = Math.round(stats.receivedAll * 0.9)
          const previousPartial = Math.round(stats.partial * 1.1)
          const previousResend = Math.round(stats.resend * 1.2)
          const previousCancelled = Math.round(stats.cancelled * 1.3)

          stats.trend = Math.round(((data.length - previousTotal) / previousTotal) * 100)
          stats.completionTrend = Math.round(
            (stats.receivedAll / data.length - previousReceived / previousTotal) * 100,
          )
          stats.receivedTrend = Math.round(
            (stats.receivedAll / data.length - previousReceived / previousTotal) * 100,
          )
          stats.partialTrend = Math.round(
            (stats.partial / data.length - previousPartial / previousTotal) * 100,
          )
          stats.resendTrend = Math.round(
            (stats.resend / data.length - previousResend / previousTotal) * 100,
          )
          stats.cancelledTrend = Math.round(
            (stats.cancelled / data.length - previousCancelled / previousTotal) * 100,
          )

          stats.successRate = Math.round(((stats.receivedAll + stats.partial) / data.length) * 100)
          stats.problemRate = Math.round(((stats.resend + stats.cancelled) / data.length) * 100)

          stats.byPaymentMethod = data.reduce((acc, item) => {
            if (item.paymentMethod) {
              if (!acc[item.paymentMethod]) {
                acc[item.paymentMethod] = { count: 0, amount: 0 }
              }
              acc[item.paymentMethod].count++
              acc[item.paymentMethod].amount += item.amount || 0
            }
            return acc
          }, {})
        }

        if (resource === 'expenses') {
          // Initialize categories with 0 values based on expenseCategoryConfig
          stats.byCategory = Object.keys(expenseCategoryConfig).reduce((acc, category) => {
            acc[category] = { count: 0, amount: 0 }
            return acc
          }, {})

          // Count and sum expenses by category
          data.forEach((item) => {
            if (item.category && stats.byCategory[item.category]) {
              stats.byCategory[item.category].count++
              stats.byCategory[item.category].amount += item.amount || 0
            }
          })

          // Calculate trends for each category based on frequency
          Object.entries(stats.byCategory).forEach(([category, categoryData]) => {
            const config = expenseCategoryConfig[category]
            let multiplier = 1.1 // Default 10% more in previous period

            // Adjust multiplier based on frequency
            switch (config.frequency) {
              case 'daily':
                multiplier = 1.05 // 5% more for daily expenses
                break
              case 'weekly':
                multiplier = 1.1 // 10% more for weekly expenses
                break
              case 'biweekly':
                multiplier = 1.15 // 15% more for biweekly expenses
                break
              case 'monthly':
                multiplier = 1.2 // 20% more for monthly expenses
                break
            }

            const previousAmount = Math.round(categoryData.amount * multiplier)
            const trend = Math.round(
              ((categoryData.amount - previousAmount) / previousAmount) * 100,
            )
            stats.byCategory[category].trend = trend
          })

          // Calculate overall trend based on weighted average of category trends
          const totalAmount = Object.values(stats.byCategory).reduce(
            (sum, cat) => sum + cat.amount,
            0,
          )
          const weightedTrend = Object.entries(stats.byCategory).reduce((sum, [_, cat]) => {
            const weight = cat.amount / totalAmount
            return sum + cat.trend * weight
          }, 0)

          stats.trend = Math.round(weightedTrend)

          // Add debug logging
          console.log('Expense stats:', {
            total: stats.totalAmount,
            byCategory: stats.byCategory,
            trend: stats.trend,
          })
        }

        if (resource === 'vehicles') {
          stats.active = data.filter((v) => v.status === 'active').length
          stats.maintenance = data.filter((v) => v.status === 'maintenance').length
          stats.lowFuel = data.filter((v) => v.fuelLevel && v.fuelLevel < 30).length
          stats.expiringDocs = data.filter((v) => {
            const now = new Date()
            const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
            const registrationExpiry = new Date(v.documents?.registration?.expiry)
            const insuranceExpiry = new Date(v.documents?.insurance?.expiry)
            return registrationExpiry <= thirtyDaysFromNow || insuranceExpiry <= thirtyDaysFromNow
          }).length
          stats.serviceDue = data.filter((v) => {
            const now = new Date()
            const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
            const nextService = new Date(v.nextServiceDue)
            return nextService <= thirtyDaysFromNow
          }).length

          stats.nextDocExpiry = data.reduce((earliest, v) => {
            const regExpiry = new Date(v.documents?.registration?.expiry)
            const insExpiry = new Date(v.documents?.insurance?.expiry)
            const nextExpiry = regExpiry < insExpiry ? regExpiry : insExpiry
            return !earliest || nextExpiry < earliest ? nextExpiry : earliest
          }, null)
          stats.nextServiceDue = data.reduce((earliest, v) => {
            const nextService = new Date(v.nextServiceDue)
            return !earliest || nextService < earliest ? nextService : earliest
          }, null)

          const previousTotal = Math.round(data.length * 1.1)
          const previousActive = Math.round(stats.active * 0.9)
          const previousMaintenance = Math.round(stats.maintenance * 1.2)
          const previousLowFuel = Math.round(stats.lowFuel * 1.3)

          stats.trend = Math.round(((data.length - previousTotal) / previousTotal) * 100)
          stats.utilizationTrend = Math.round(
            (stats.active / data.length - previousActive / previousTotal) * 100,
          )
          stats.maintenanceTrend = Math.round(
            (stats.maintenance / data.length - previousMaintenance / previousTotal) * 100,
          )
          stats.activeTrend = Math.round(
            (stats.active / data.length - previousActive / previousTotal) * 100,
          )
          stats.fuelTrend = Math.round(
            (stats.lowFuel / data.length - previousLowFuel / previousTotal) * 100,
          )
        }

        stats.byBranch = data.reduce((acc, item) => {
          if (item.branch) {
            if (!acc[item.branch]) {
              acc[item.branch] = { total: 0, active: 0, maintenance: 0 }
            }
            acc[item.branch].total++
            if (item.status) {
              acc[item.branch][item.status] = (acc[item.branch][item.status] || 0) + 1
            }
          }
          return acc
        }, {})

        console.log(`Generated stats for ${resource}:`, {
          scope,
          options,
          total: data.length,
          filtered: data.length,
        })

        return {
          ...stats,
          period, // Add the determined period to stats
        }
      } finally {
        this.pendingRequests.delete(requestKey)
      }
    })()

    this.pendingRequests.set(requestKey, requestPromise)
    return requestPromise
  }

  async create(resource, data, scope) {
    if (!this.canModifyInScope(resource, scope)) {
      throw new Error(`Cannot create ${resource} in current scope`)
    }
    const dataWithScope = this.addScopeToData(data, scope)
    return this.baseProvider.create(resource, dataWithScope)
  }

  async update(resource, id, data, scope) {
    const { data: items } = await this.getData(resource, scope, { filter: { id } })
    if (items.length === 0) {
      throw new Error(`Cannot update ${resource} in current scope`)
    }
    return this.baseProvider.update(resource, id, data)
  }

  async delete(resource, id, scope) {
    const { data: items } = await this.getData(resource, scope, { filter: { id } })
    if (items.length === 0) {
      throw new Error(`Cannot delete ${resource} in current scope`)
    }
    return this.baseProvider.delete(resource, id)
  }

  canModifyInScope(resource, scope) {
    switch (scope.type) {
      case 'global':
        return true
      case 'region':
      case 'branch':
      case 'personal':
        return ['deliveries', 'expenses'].includes(resource)
      default:
        return false
    }
  }

  addScopeToData(data, scope) {
    switch (scope.type) {
      case 'global':
        return data
      case 'region':
        return { ...data, region: scope.value }
      case 'branch':
        return { ...data, branch: scope.value }
      case 'personal':
        return { ...data, userId: scope.value }
      default:
        return data
    }
  }

  validateScopeAccess(resource, scope) {
    if (!scope) return false

    const accessRules = {
      deliveries: ['global', 'region', 'branch', 'personal'],
      expenses: ['global', 'region', 'branch'],
      vehicles: ['global', 'region', 'branch'],
    }

    return accessRules[resource]?.includes(scope.type) || false
  }
}

export const dataProviderFactory = new DataProviderFactory()
