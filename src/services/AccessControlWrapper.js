/**
 * @typedef {import('./interfaces/DataProvider').Scope} Scope
 * @typedef {import('./interfaces/DataProvider').QueryParams} QueryParams
 */

export class AccessControlWrapper {
  /**
   * Filter data based on scope
   * @param {Array} data - Raw data array
   * @param {Scope} scope - Access scope
   * @returns {Array} - Filtered data
   */
  static filterByScope(data, scope) {
    if (!data || !Array.isArray(data)) {
      console.log('Invalid data provided')
      return []
    }

    if (!scope || scope.type === 'global') {
      console.log('Global scope or no scope - returning all data')
      return data
    }

    console.log(`Filtering by ${scope.type} scope:`, scope.value)
    console.log('Initial data count:', data.length)

    // Define scope hierarchy and field mappings with validation
    const scopeConfig = {
      region: {
        fields: ['region'],
        branchField: 'branch',
        includesBranches: true,
        validate: (item) => item.region || item.branch, // Must have either region or branch
      },
      branch: {
        fields: ['branch'],
        includesBranches: false,
        validate: (item) => item.branch, // Must have branch
      },
      personal: {
        fields: ['userId', 'assignedTo', 'driver', 'driverId', 'assignedDriverId'],
        includesBranches: false,
        validate: (item) =>
          item.userId || item.driverId || item.assignedTo || item.driver || item.assignedDriverId, // Must have at least one identifier
      },
    }

    const config = scopeConfig[scope.type]
    if (!config) {
      console.warn('Unknown scope type:', scope.type)
      return []
    }

    const filteredData = data.filter((item) => {
      // Validate item has required fields
      if (!config.validate(item)) {
        console.warn('Item missing required fields for scope:', item)
        return false
      }

      // Check direct field matches
      const fieldMatch = config.fields.some((field) => item[field] === scope.value)

      // For region scope, also check branch prefixes
      const branchMatch =
        config.includesBranches &&
        item[config.branchField] &&
        (item[config.branchField].startsWith(scope.value) ||
          item[config.branchField] === scope.value)

      return fieldMatch || branchMatch
    })

    console.log('Filtered data count:', filteredData.length)
    return filteredData
  }

  /**
   * Wrap a data provider to add scope-based filtering
   * @param {Object} provider - Data provider instance
   * @returns {Object} - Wrapped provider with scope filtering
   */
  static wrapProvider(provider) {
    return {
      ...provider,

      /**
       * Fetch data with scope-based filtering
       * @param {string} resource
       * @param {Scope} scope
       * @param {QueryParams} params
       */
      async fetchWithScope(resource, scope, params = {}) {
        // First get data using original fetch
        const result = await provider.fetch(resource, params)

        // Then filter the data based on scope
        const filteredData = this.filterByScope(result.data, scope)

        return {
          ...result,
          data: filteredData,
          total: filteredData.length,
        }
      },

      /**
       * Get stats with scope-based filtering
       * @param {string} resource
       * @param {Scope} scope
       * @param {Object} options
       */
      async getStats(resource, scope, options = {}) {
        // Get filtered data first
        const { data } = await this.fetchWithScope(resource, scope)

        // Then calculate stats based on the resource type
        switch (resource) {
          case 'deliveries':
            return provider.getDeliveryStats({ ...options, data })
          case 'expenses':
            return provider.getExpenseStats({ ...options, data })
          case 'vehicles':
            return provider.getVehicleStats({ ...options, data })
          default:
            throw new Error(`Stats not implemented for resource: ${resource}`)
        }
      },
    }
  }
}
