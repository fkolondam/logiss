import { MockDataProvider } from './MockDataProvider'
import { GoogleSheetsProvider } from './providers/GoogleSheetsProvider'
import { AccessControlWrapper } from './AccessControlWrapper'
import { sheetsConfig } from './config/googleSheets'

class DataProviderFactory {
  constructor() {
    // Default to mock provider, will be switched to sheets provider when initialized
    this.baseProvider = new MockDataProvider()
    this.sheetsProvider = null
    this.pendingRequests = new Map()
    this.isInitialized = false
  }

  async initialize() {
    try {
      // Only initialize if sheets URLs are configured
      if (sheetsConfig.deliveriesSheetUrl && sheetsConfig.branchesSheetUrl) {
        this.sheetsProvider = new GoogleSheetsProvider(sheetsConfig)
        await this.sheetsProvider.initialize()
        this.baseProvider = this.sheetsProvider
        console.log('Successfully initialized Google Sheets provider')
      } else {
        console.log('Using mock data provider (Google Sheets URLs not configured)')
      }
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize Google Sheets provider:', error)
      console.log('Falling back to mock data provider')
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
