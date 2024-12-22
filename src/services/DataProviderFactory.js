import { MockDataProvider } from './MockDataProvider'
import { AccessControlWrapper } from './AccessControlWrapper'

/**
 * @typedef {import('./interfaces/DataProvider').Scope} Scope
 * @typedef {import('./interfaces/DataProvider').QueryParams} QueryParams
 */

class DataProviderFactory {
  constructor() {
    this.baseProvider = new MockDataProvider()
    this.pendingRequests = new Map()
  }

  /**
   * Get pending request key
   * @private
   */
  getPendingKey(resource, scope, params) {
    const scopeKey = scope ? `${scope.type}:${scope.value || 'all'}` : 'global'
    return `${resource}:${scopeKey}:${JSON.stringify(params)}`
  }

  /**
   * Get data with scope-based access control
   * @param {string} resource - Resource name (e.g., 'deliveries', 'expenses')
   * @param {Scope} scope - Access scope
   * @param {QueryParams} [params] - Query parameters
   */
  async getData(resource, scope, params = {}) {
    console.log(`Fetching ${resource} with scope:`, scope)

    // Validate scope access
    if (!this.validateScopeAccess(resource, scope)) {
      throw new Error(`Access denied: Invalid scope for resource ${resource}`)
    }

    // Check for pending request
    const requestKey = this.getPendingKey(resource, scope, params)
    if (this.pendingRequests.has(requestKey)) {
      console.log(`Reusing pending request for ${requestKey}`)
      return this.pendingRequests.get(requestKey)
    }

    // Create new request
    const requestPromise = (async () => {
      try {
        // Add scope-based filters to params
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
              // Add all possible personal identifiers
              scopedParams.userId = scope.value
              scopedParams.driverId = scope.value
              scopedParams.assignedTo = scope.value
              scopedParams.driver = scope.value
              break
          }
        }

        // Get data from provider with scoped params
        const result = await this.baseProvider.fetch(resource, scopedParams)

        // Apply additional scope-based filtering for hierarchical relationships
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
        // Remove from pending requests when done
        this.pendingRequests.delete(requestKey)
      }
    })()

    // Store the promise
    this.pendingRequests.set(requestKey, requestPromise)

    return requestPromise
  }

  /**
   * Get stats with scope-based access control
   * @param {string} resource - Resource name
   * @param {Scope} scope - Access scope
   * @param {Object} [options] - Additional options
   */
  async getStats(resource, scope, options = {}) {
    // Validate scope access
    if (!this.validateScopeAccess(resource, scope)) {
      throw new Error(`Access denied: Invalid scope for resource ${resource}`)
    }

    // Check for pending request
    const requestKey = `stats:${this.getPendingKey(resource, scope, options)}`
    if (this.pendingRequests.has(requestKey)) {
      console.log(`Reusing pending stats request for ${requestKey}`)
      return this.pendingRequests.get(requestKey)
    }

    // Create new request
    const requestPromise = (async () => {
      try {
        // Get filtered data first
        const { data } = await this.getData(resource, scope)

        // Calculate stats based on the filtered data
        const stats = {
          total: data.length,
          totalAmount: data.reduce((sum, item) => sum + (item.amount || 0), 0),
        }

        // Calculate status counts
        stats.byStatus = data.reduce((acc, item) => {
          if (item.status) {
            acc[item.status] = (acc[item.status] || 0) + 1
          }
          return acc
        }, {})

        // Calculate payment method stats for deliveries
        if (resource === 'deliveries') {
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

        // Calculate category stats for expenses
        if (resource === 'expenses') {
          stats.byCategory = data.reduce((acc, item) => {
            if (item.category) {
              if (!acc[item.category]) {
                acc[item.category] = { count: 0, amount: 0 }
              }
              acc[item.category].count++
              acc[item.category].amount += item.amount || 0
            }
            return acc
          }, {})
        }

        // Calculate branch stats
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

        // Add specific stats for vehicles
        if (resource === 'vehicles') {
          stats.active = stats.byStatus?.active || 0
          stats.maintenance = stats.byStatus?.maintenance || 0
          stats.lowFuel = data.filter((v) => v.fuelLevel && v.fuelLevel < 30).length
        }

        console.log(`Generated stats for ${resource}:`, {
          scope,
          options,
          total: data.length,
          filtered: data.length,
        })

        return stats
      } finally {
        // Remove from pending requests when done
        this.pendingRequests.delete(requestKey)
      }
    })()

    // Store the promise
    this.pendingRequests.set(requestKey, requestPromise)

    return requestPromise
  }

  /**
   * Create new resource with scope validation
   * @param {string} resource
   * @param {Object} data
   * @param {Scope} scope
   */
  async create(resource, data, scope) {
    // Validate if user can create in this scope
    if (!this.canModifyInScope(resource, scope)) {
      throw new Error(`Cannot create ${resource} in current scope`)
    }

    // Add scope information to data
    const dataWithScope = this.addScopeToData(data, scope)

    return this.baseProvider.create(resource, dataWithScope)
  }

  /**
   * Update resource with scope validation
   * @param {string} resource
   * @param {string|number} id
   * @param {Object} data
   * @param {Scope} scope
   */
  async update(resource, id, data, scope) {
    // First check if item exists and is accessible in current scope
    const { data: items } = await this.getData(resource, scope, {
      filter: { id },
    })

    if (items.length === 0) {
      throw new Error(`Cannot update ${resource} in current scope`)
    }

    return this.baseProvider.update(resource, id, data)
  }

  /**
   * Delete resource with scope validation
   * @param {string} resource
   * @param {string|number} id
   * @param {Scope} scope
   */
  async delete(resource, id, scope) {
    // First check if item exists and is accessible in current scope
    const { data: items } = await this.getData(resource, scope, {
      filter: { id },
    })

    if (items.length === 0) {
      throw new Error(`Cannot delete ${resource} in current scope`)
    }

    return this.baseProvider.delete(resource, id)
  }

  /**
   * Check if modification is allowed in current scope
   * @private
   */
  canModifyInScope(resource, scope) {
    switch (scope.type) {
      case 'global':
        return true
      case 'region':
        return ['deliveries', 'expenses'].includes(resource)
      case 'branch':
        return ['deliveries', 'expenses'].includes(resource)
      case 'personal':
        return ['deliveries', 'expenses'].includes(resource)
      default:
        return false
    }
  }

  /**
   * Add scope information to data
   * @private
   */
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

  /**
   * Validate if the scope has access to the resource
   * @private
   */
  validateScopeAccess(resource, scope) {
    if (!scope) return false

    // Define resource access rules
    const accessRules = {
      deliveries: ['global', 'region', 'branch', 'personal'],
      expenses: ['global', 'region', 'branch'],
      vehicles: ['global', 'region', 'branch'],
    }

    // Check if resource exists and scope type is allowed
    return accessRules[resource]?.includes(scope.type) || false
  }
}

// Export a singleton instance
export const dataProviderFactory = new DataProviderFactory()
