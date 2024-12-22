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
    console.log('Filtering data by scope:', scope)
    console.log('Initial data count:', data.length)

    if (!scope) {
      console.log('No scope provided, returning all data')
      return data
    }

    let filteredData = []

    switch (scope.type) {
      case 'global':
        console.log('Global scope - no filtering')
        filteredData = data
        break

      case 'region':
        console.log('Filtering by region:', scope.value)
        filteredData = data.filter((item) => {
          const matchesRegion = item.region === scope.value
          const matchesBranch = item.branch && item.branch.startsWith(scope.value)
          console.log('Item:', {
            item,
            matchesRegion,
            matchesBranch,
          })
          return matchesRegion || matchesBranch
        })
        break

      case 'branch':
        console.log('Filtering by branch:', scope.value)
        filteredData = data.filter((item) => {
          const matches = item.branch === scope.value
          console.log('Item:', { item, matches })
          return matches
        })
        break

      case 'personal':
        console.log('Filtering by personal scope:', scope.value)
        filteredData = data.filter((item) => {
          const matchesUserId = item.userId === scope.value
          const matchesAssigned = item.assignedTo === scope.value
          const matchesDriver = item.driver === scope.value
          console.log('Item:', {
            item,
            matchesUserId,
            matchesAssigned,
            matchesDriver,
          })
          return matchesUserId || matchesAssigned || matchesDriver
        })
        break

      default:
        console.log('Unknown scope type:', scope.type)
        return []
    }

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
