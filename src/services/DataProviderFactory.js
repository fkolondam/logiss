import { MockDataProvider } from './MockDataProvider'
import { GoogleSheetsProvider } from './providers/GoogleSheetsProvider'
import { AccessControlWrapper } from './AccessControlWrapper'
import { sheetsConfig } from './config/googleSheets'
import { DataProvider } from './interfaces/DataProvider'

/**
 * Available data source types
 */
export const DataSourceType = {
  MOCK: 'mock',
  GOOGLE_SHEETS: 'google_sheets',
  MYSQL: 'mysql',
}

/**
 * Factory class for managing and switching between different data providers
 * @extends {DataProvider}
 */
class DataProviderFactory extends DataProvider {
  constructor() {
    super()
    this.providers = new Map()
    this.currentProvider = null
    this.pendingRequests = new Map()
    this.initialized = new Set()
  }

  /**
   * Get provider instance for a specific data source type
   * @param {string} sourceType - Type of data source
   * @returns {DataProvider} Provider instance
   */
  getProvider(sourceType) {
    if (!this.providers.has(sourceType)) {
      switch (sourceType) {
        case DataSourceType.MOCK:
          this.providers.set(sourceType, new MockDataProvider())
          break
        case DataSourceType.GOOGLE_SHEETS:
          this.providers.set(sourceType, new GoogleSheetsProvider(sheetsConfig))
          break
        // Add other providers here as needed
        default:
          throw new Error(`Unsupported data source type: ${sourceType}`)
      }
    }
    return this.providers.get(sourceType)
  }

  /**
   * Switch to a different data source
   * @param {string} sourceType - Type of data source to switch to
   */
  async setDataSource(sourceType) {
    console.log(`Switching data source to: ${sourceType}`)
    try {
      const provider = this.getProvider(sourceType)

      // Initialize provider if not already initialized
      if (!this.initialized.has(sourceType)) {
        await provider.initialize()
        this.initialized.add(sourceType)
      }

      this.currentProvider = provider
      this.clearCache() // Clear cache when switching providers
      console.log(`Successfully switched to ${sourceType} data source`)
    } catch (error) {
      console.error(`Failed to switch to ${sourceType} data source:`, error)
      // Fallback to mock data in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Falling back to mock data provider')
        this.currentProvider = this.getProvider(DataSourceType.MOCK)
      } else {
        throw error
      }
    }
  }

  /**
   * Get the current active provider
   * @returns {DataProvider} Current provider instance
   */
  getCurrentProvider() {
    if (!this.currentProvider) {
      // Default to mock data if no provider is set
      this.currentProvider = this.getProvider(DataSourceType.MOCK)
    }
    return this.currentProvider
  }

  /**
   * Generate a unique key for caching requests
   */
  getPendingKey(resource, scope, params) {
    const scopeKey = scope ? `${scope.type}:${scope.value || 'all'}` : 'global'
    return `${resource}:${scopeKey}:${JSON.stringify(params)}`
  }

  /**
   * Build parameters with scope-based filtering
   */
  buildScopedParams(params, scope) {
    const scopedParams = { ...params }
    if (scope && scope.type !== 'global') {
      switch (scope.type) {
        case 'region':
          scopedParams.region = scope.value
          break
        case 'branch':
          scopedParams.branchId = scope.value
          break
        case 'personal':
          scopedParams.userId = scope.value
          scopedParams.driverId = scope.value
          scopedParams.assignedTo = scope.value
          scopedParams.driver = scope.value
          break
      }
    }
    return scopedParams
  }

  /**
   * Legacy method for getting data with scope-based filtering
   */
  async getData(resource, scope, params = {}) {
    const provider = this.getCurrentProvider()
    if (!provider) {
      throw new Error('No data provider available')
    }

    console.log(`Getting ${resource} data with scope:`, scope, 'params:', params)

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
        // Build scoped parameters
        const scopedParams = this.buildScopedParams(params, scope)
        console.log(`Built scoped params for ${resource}:`, scopedParams)

        // Fetch data from provider
        const result = await provider.fetch(resource, scopedParams)
        console.log(`Received ${resource} data:`, {
          total: result.data?.length || 0,
          sample: result.data?.[0] || null,
          source: provider.constructor.name,
        })

        // Apply access control filtering
        const filteredData = AccessControlWrapper.filterByScope(result.data, scope)
        console.log(`Filtered ${resource} data:`, {
          total: result.data?.length || 0,
          filtered: filteredData.length,
          scope,
          params: scopedParams,
        })

        return {
          ...result,
          data: filteredData,
          total: filteredData.length,
          metadata: {
            ...result.metadata,
            source: provider.constructor.name,
            timestamp: new Date().toISOString(),
          },
        }
      } catch (error) {
        console.error(`Error fetching ${resource} data:`, error)
        throw new Error(`Failed to fetch ${resource} data: ${error.message}`)
      } finally {
        this.pendingRequests.delete(requestKey)
      }
    })()

    this.pendingRequests.set(requestKey, requestPromise)
    return requestPromise
  }

  /**
   * @inheritdoc
   */
  async fetchWithScope(resource, scope, params = {}) {
    // For now, use the existing getData method
    // This ensures backward compatibility while we transition to the new interface
    return this.getData(resource, scope, params)
  }

  /**
   * @inheritdoc
   */
  async fetch(resource, params = {}) {
    // For backward compatibility, fetch without scope defaults to global scope
    return this.fetchWithScope(resource, { type: 'global' }, params)
  }

  /**
   * @inheritdoc
   */
  async getStats(resource, scope, options = {}) {
    const provider = this.getCurrentProvider()
    return provider.getStats(resource, scope, options)
  }

  validateScopeAccess(resource, scope) {
    if (!scope) return false

    const accessRules = {
      deliveries: ['global', 'region', 'branch', 'personal'],
      expenses: ['global', 'region', 'branch'],
      vehicles: ['global', 'region', 'branch'],
      branches: ['global'],
    }

    return accessRules[resource]?.includes(scope.type) || false
  }

  clearCache() {
    // Clear cache for all providers
    for (const provider of this.providers.values()) {
      if (provider.clearCache) {
        provider.clearCache()
      }
    }
    this.pendingRequests.clear()
  }
}

export const dataProviderFactory = new DataProviderFactory()
