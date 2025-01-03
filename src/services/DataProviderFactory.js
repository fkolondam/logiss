import { MockDataProvider } from './MockDataProvider'
import { GoogleSheetsProvider } from './providers/GoogleSheetsProvider'
import { AccessControlWrapper } from './AccessControlWrapper'
import { sheetsConfig } from './config/googleSheets'

class DataProviderFactory {
  constructor() {
    this.baseProvider = null
    this.sheetsProvider = null
    this.pendingRequests = new Map()
    this.isInitialized = false
  }

  async initialize() {
    try {
      // Always try to initialize Google Sheets provider if URLs are configured
      if (sheetsConfig.deliveriesSheetUrl && sheetsConfig.branchesSheetUrl) {
        console.log('Initializing Google Sheets provider...')
        this.sheetsProvider = new GoogleSheetsProvider(sheetsConfig)
        await this.sheetsProvider.initialize()
        this.baseProvider = this.sheetsProvider
        console.log('Successfully initialized Google Sheets provider')
      } else {
        throw new Error('Google Sheets URLs not configured')
      }
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize Google Sheets provider:', error)
      // Only fallback to mock if explicitly configured or in development
      if (process.env.NODE_ENV === 'development' || process.env.USE_MOCK_DATA) {
        console.log('Falling back to mock data provider')
        this.baseProvider = new MockDataProvider()
      } else {
        throw error // Re-throw in production to show error to user
      }
    }
  }

  getPendingKey(resource, scope, params) {
    const scopeKey = scope ? `${scope.type}:${scope.value || 'all'}` : 'global'
    return `${resource}:${scopeKey}:${JSON.stringify(params)}`
  }

  async getData(resource, scope, params = {}) {
    // Ensure provider is initialized
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (!this.baseProvider) {
      throw new Error('No data provider available')
    }

    console.log(`Fetching ${resource} with scope:`, scope, 'params:', params)

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
        const result = await this.baseProvider.fetch(resource, scopedParams)
        console.log(`Received ${resource} data:`, {
          total: result.data?.length || 0,
          sample: result.data?.[0] || null,
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
            scope,
            params: scopedParams,
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

  validateScopeAccess(resource, scope) {
    if (!scope) return false

    const accessRules = {
      deliveries: ['global', 'region', 'branch', 'personal'],
      expenses: ['global', 'region', 'branch'],
      vehicles: ['global', 'region', 'branch'],
      branches: ['global'], // Only global scope for branches
    }

    return accessRules[resource]?.includes(scope.type) || false
  }

  // Method to force refresh cache
  clearCache() {
    if (this.sheetsProvider) {
      this.sheetsProvider.clearCache()
    }
  }
}

export const dataProviderFactory = new DataProviderFactory()
