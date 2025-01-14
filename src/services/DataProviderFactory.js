import { MockDataProvider } from './MockDataProvider'
import { GoogleSheetsProvider } from './providers/GoogleSheetsProvider'
import { AccessControlWrapper } from './AccessControlWrapper'
import { sheetsConfig } from './config/googleSheets'
import { DataProvider } from './interfaces/DataProvider'

// Timezone offset for Asia/Jakarta (GMT+7)
const TIMEZONE_OFFSET = 7 * 60 * 60 * 1000 // 7 hours in milliseconds

function getJakartaDate(date = new Date()) {
  // Convert to Jakarta time
  const utc = date.getTime() + date.getTimezoneOffset() * 60000
  return new Date(utc + TIMEZONE_OFFSET)
}

export const DataSourceType = {
  MOCK: 'mock',
  GOOGLE_SHEETS: 'google_sheets',
  MYSQL: 'mysql',
}

class DataProviderFactory extends DataProvider {
  constructor() {
    super()
    this.providers = new Map()
    this.currentProvider = null
    this.pendingRequests = new Map()
    this.initialized = new Set()
  }

  getProvider(sourceType) {
    if (!this.providers.has(sourceType)) {
      switch (sourceType) {
        case DataSourceType.MOCK:
          this.providers.set(sourceType, new MockDataProvider())
          break
        case DataSourceType.GOOGLE_SHEETS:
          this.providers.set(sourceType, new GoogleSheetsProvider(sheetsConfig))
          break
        default:
          throw new Error(`Unsupported data source type: ${sourceType}`)
      }
    }
    return this.providers.get(sourceType)
  }

  async setDataSource(sourceType) {
    try {
      if (this.currentProvider?.dispose) {
        this.currentProvider.dispose()
      }

      const provider = this.getProvider(sourceType)

      if (!this.initialized.has(sourceType)) {
        await provider.initialize()
        this.initialized.add(sourceType)
      }

      this.currentProvider = provider
    } catch (error) {
      throw error
    }
  }

  getCurrentProvider() {
    if (!this.currentProvider) {
      throw new Error('No data provider has been set. Please call setDataSource first.')
    }
    return this.currentProvider
  }

  getPendingKey(resource, scope, params) {
    const scopeKey = scope ? `${scope.type}:${scope.value || 'all'}` : 'global'
    return `${resource}:${scopeKey}:${JSON.stringify(params)}`
  }

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

  async getData(resource, scope, params = {}) {
    const provider = this.getCurrentProvider()
    if (!provider) {
      throw new Error('No data provider available')
    }

    if (!this.validateScopeAccess(resource, scope)) {
      throw new Error(`Access denied: Invalid scope for resource ${resource}`)
    }

    // Convert date range to Jakarta timezone
    const dateRange = params.dateRange
      ? {
          start: getJakartaDate(new Date(params.dateRange.start)).toISOString().split('T')[0],
          end: getJakartaDate(new Date(params.dateRange.end)).toISOString().split('T')[0],
        }
      : undefined

    // Create a stable key for caching that includes the date range
    const requestKey = this.getPendingKey(resource, scope, {
      ...params,
      dateRange,
    })

    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey)
    }

    const requestPromise = (async () => {
      try {
        const scopedParams = this.buildScopedParams({ ...params, dateRange }, scope)
        const result = await provider.fetch(resource, scopedParams)

        if (!result || !result.data) {
          console.error(`No data returned for ${resource}`)
          return {
            data: [],
            total: 0,
            metadata: {
              source: provider.constructor.name,
              timestamp: getJakartaDate().toISOString(),
              error: 'No data returned from provider',
            },
          }
        }

        const filteredData = AccessControlWrapper.filterByScope(result.data, scope)

        // Log only summary statistics
        console.log(`${resource} data stats:`, {
          total: filteredData.length,
          dateRange: scopedParams.dateRange,
          lastRecord:
            filteredData.length > 0
              ? {
                  id: filteredData[filteredData.length - 1].id,
                  date: filteredData[filteredData.length - 1].date,
                  timestamp: filteredData[filteredData.length - 1].timestamp,
                }
              : null,
          jakartaTime: getJakartaDate().toISOString(),
        })

        return {
          ...result,
          data: filteredData,
          total: filteredData.length,
          metadata: {
            ...result.metadata,
            source: provider.constructor.name,
            timestamp: getJakartaDate().toISOString(),
            dateRange: scopedParams.dateRange,
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

  async fetchWithScope(resource, scope, params = {}) {
    return this.getData(resource, scope, params)
  }

  async fetch(resource, params = {}) {
    return this.fetchWithScope(resource, { type: 'global' }, params)
  }

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
    if (document.visibilityState === 'visible') {
      console.log('Clearing cache for all providers')
      for (const provider of this.providers.values()) {
        if (provider.clearCache) {
          provider.clearCache()
        }
      }
      this.pendingRequests.clear()
      console.log('Cache cleared at:', getJakartaDate().toISOString())
    }
  }

  async refreshCache() {
    console.log('Forcing immediate cache refresh')
    this.clearCache()

    if (this.currentProvider) {
      try {
        await this.currentProvider.initialize()
        console.log('Cache refreshed successfully')
      } catch (error) {
        console.error('Error refreshing cache:', error)
        throw error
      }
    }
  }

  dispose() {
    this.clearCache()
    this.providers.clear()
    this.currentProvider = null
  }
}

export const dataProviderFactory = new DataProviderFactory()
