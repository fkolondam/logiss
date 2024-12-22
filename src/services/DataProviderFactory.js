import { MockDataProvider } from './MockDataProvider'
import { AccessControlWrapper } from './AccessControlWrapper'

/**
 * @typedef {import('./interfaces/DataProvider').Scope} Scope
 * @typedef {import('./interfaces/DataProvider').QueryParams} QueryParams
 */

class DataProviderFactory {
  constructor() {
    this.baseProvider = new MockDataProvider()
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

    // First get raw data from mock provider
    const result = await this.baseProvider.fetch(resource, params)

    // Then apply scope-based filtering
    const filteredData = AccessControlWrapper.filterByScope(result.data, scope)

    console.log(`Filtered ${resource} data:`, {
      total: result.data.length,
      filtered: filteredData.length,
      scope,
    })

    return {
      ...result,
      data: filteredData,
      total: filteredData.length,
    }
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

    // Get filtered data first
    const { data } = await this.getData(resource, scope)

    // Then calculate stats based on filtered data
    switch (resource) {
      case 'deliveries':
        return this.baseProvider.getDeliveryStats({ ...options, data })
      case 'expenses':
        return this.baseProvider.getExpenseStats({ ...options, data })
      case 'vehicles':
        return this.baseProvider.getVehicleStats({ ...options, data })
      default:
        throw new Error(`Stats not implemented for resource: ${resource}`)
    }
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
