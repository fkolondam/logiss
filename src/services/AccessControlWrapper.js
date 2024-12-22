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
    if (!scope) return data

    switch (scope.type) {
      case 'global':
        return data // No filtering for global scope

      case 'region':
        return data.filter(
          (item) =>
            // Filter by region if item has region property
            item.region === scope.value ||
            // Or if item has branch that belongs to the region (using branch prefix)
            (item.branch && item.branch.startsWith(scope.value)),
        )

      case 'branch':
        return data.filter((item) => item.branch === scope.value)

      case 'personal':
        return data.filter(
          (item) =>
            // Filter personal deliveries/expenses
            item.userId === scope.value ||
            // Or assigned vehicles
            item.assignedTo === scope.value ||
            // Or if the user is the driver
            item.driver === scope.value,
        )

      default:
        return []
    }
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
