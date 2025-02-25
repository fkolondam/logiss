import { MockDataProvider } from './MockDataProvider'
import { GoogleSheetsProvider } from './providers/GoogleSheetsProvider'
import { AccessControlWrapper } from './AccessControlWrapper'
import { sheetsConfig } from './config/googleSheets'
import { DataProvider } from './interfaces/DataProvider'
import { getJakartaDate } from '../config/dateFormat'

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

    // Use date range as is - it's already in Jakarta timezone from periods.js
    const dateRange = params.dateRange

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
    }
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

  dispose() {
    this.providers.clear()
    this.currentProvider = null
  }
}

export const dataProviderFactory = new DataProviderFactory()
