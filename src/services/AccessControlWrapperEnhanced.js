/**
 * @typedef {import('./interfaces/DataProvider').Scope} Scope
 * @typedef {import('./interfaces/DataProvider').QueryParams} QueryParams
 */

export class AccessControlWrapperEnhanced {
  /**
   * Filter data based on scope with enhanced rules
   * @param {Array} data - Raw data array
   * @param {Scope} scope - Access scope
   * @param {Object} options - Additional filtering options
   * @returns {Array} - Filtered data
   */
  filterByScope(data, scope, options = {}) {
    console.log('Filtering data by scope:', scope, 'with options:', options)
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
          // Enhanced region matching
          const matchesRegion = item.region?.toLowerCase() === scope.value?.toLowerCase()
          const matchesBranch = item.branch?.toLowerCase().startsWith(scope.value?.toLowerCase())
          const matchesLocation = item.location?.toLowerCase().includes(scope.value?.toLowerCase())

          console.log('Item:', {
            item,
            matchesRegion,
            matchesBranch,
            matchesLocation,
          })

          return matchesRegion || matchesBranch || matchesLocation
        })
        break

      case 'branch':
        console.log('Filtering by branch:', scope.value)
        filteredData = data.filter((item) => {
          // Enhanced branch matching
          const matchesBranch = item.branch?.toLowerCase() === scope.value?.toLowerCase()
          const matchesLocation = item.location?.toLowerCase().includes(scope.value?.toLowerCase())
          const matchesAssigned = item.assignedBranch?.toLowerCase() === scope.value?.toLowerCase()

          console.log('Item:', {
            item,
            matchesBranch,
            matchesLocation,
            matchesAssigned,
          })

          return matchesBranch || matchesLocation || matchesAssigned
        })
        break

      case 'personal':
        console.log('Filtering by personal scope:', scope.value)
        filteredData = data.filter((item) => {
          // Enhanced personal matching
          const matchesUserId = item.userId?.toLowerCase() === scope.value?.toLowerCase()
          const matchesAssigned = item.assignedTo?.toLowerCase() === scope.value?.toLowerCase()
          const matchesDriver = item.driver?.toLowerCase() === scope.value?.toLowerCase()
          const matchesHelper = item.helper?.toLowerCase() === scope.value?.toLowerCase()
          const matchesCreatedBy = item.createdBy?.toLowerCase() === scope.value?.toLowerCase()

          console.log('Item:', {
            item,
            matchesUserId,
            matchesAssigned,
            matchesDriver,
            matchesHelper,
            matchesCreatedBy,
          })

          return (
            matchesUserId || matchesAssigned || matchesDriver || matchesHelper || matchesCreatedBy
          )
        })
        break

      default:
        console.log('Unknown scope type:', scope.type)
        return []
    }

    // Apply additional filters if provided
    if (options.filters) {
      filteredData = this.applyFilters(filteredData, options.filters)
    }

    console.log('Filtered data count:', filteredData.length)
    return filteredData
  }

  /**
   * Apply additional filters to data
   * @param {Array} data - Data array
   * @param {Object} filters - Filter conditions
   * @returns {Array} - Filtered data
   */
  applyFilters(data, filters) {
    return data.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        // Skip null/undefined filters
        if (value == null) return true

        // Handle array values (OR condition)
        if (Array.isArray(value)) {
          return value.some((v) => this.matchFilter(item[key], v))
        }

        // Handle single values
        return this.matchFilter(item[key], value)
      })
    })
  }

  /**
   * Match a single filter condition
   * @param {any} itemValue - Value from the data item
   * @param {any} filterValue - Value to filter by
   * @returns {boolean} - Whether the values match
   */
  matchFilter(itemValue, filterValue) {
    // Handle null/undefined
    if (itemValue == null || filterValue == null) {
      return itemValue === filterValue
    }

    // Handle dates
    if (filterValue instanceof Date) {
      const itemDate = new Date(itemValue)
      return itemDate.getTime() === filterValue.getTime()
    }

    // Handle regular expressions
    if (filterValue instanceof RegExp) {
      return filterValue.test(String(itemValue))
    }

    // Handle objects (deep equality)
    if (typeof filterValue === 'object') {
      return JSON.stringify(itemValue) === JSON.stringify(filterValue)
    }

    // Handle strings (case-insensitive)
    if (typeof itemValue === 'string' && typeof filterValue === 'string') {
      return itemValue.toLowerCase().includes(filterValue.toLowerCase())
    }

    // Default comparison
    return itemValue === filterValue
  }

  /**
   * Wrap a data provider to add enhanced scope-based filtering
   * @param {Object} provider - Data provider instance
   * @returns {Object} - Wrapped provider with scope filtering
   */
  wrapProvider(provider) {
    return {
      ...provider,

      /**
       * Fetch data with scope-based filtering
       * @param {string} resource
       * @param {Scope} scope
       * @param {QueryParams} params
       */
      async fetchWithScope(resource, scope, params = {}) {
        // Get data using original fetch
        const result = await provider.fetch(resource, params)

        // Filter the data based on scope
        const filteredData = this.filterByScope(result.data, scope, params)

        // Prepare result with metadata
        return {
          ...result,
          data: filteredData,
          total: filteredData.length,
          metadata: {
            scope: scope,
            timestamp: Date.now(),
            filters: params.filters || {},
            originalTotal: result.data.length,
          },
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
        const { data } = await this.fetchWithScope(resource, scope, options)

        // Calculate stats based on the resource type
        let stats
        switch (resource) {
          case 'deliveries':
            stats = await provider.getDeliveryStats({ ...options, data })
            break
          case 'expenses':
            stats = await provider.getExpenseStats({ ...options, data })
            break
          case 'vehicles':
            stats = await provider.getVehicleStats({ ...options, data })
            break
          default:
            throw new Error(`Stats not implemented for resource: ${resource}`)
        }

        // Add metadata
        return {
          ...stats,
          metadata: {
            scope: scope,
            timestamp: Date.now(),
            dataCount: data.length,
            period: options.period || 'all',
          },
        }
      },
    }
  }
}
