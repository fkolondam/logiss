import { defineStore } from 'pinia'
import { DataProviderFactory, DataSourceType } from '../services/DataProviderFactory'

export const useDataSourceStore = defineStore('dataSource', {
  state: () => ({
    provider: null,
    factory: DataProviderFactory.getInstance(),
    currentType: DataSourceType.MOCK,
    isInitialized: false,
    error: null,
  }),

  getters: {
    isReady: (state) => state.isInitialized && state.provider !== null,
    hasError: (state) => state.error !== null,
  },

  actions: {
    async initialize() {
      try {
        if (this.isInitialized) return this.provider

        console.log('Initializing data provider...')
        this.provider = this.factory.getProvider(this.currentType)

        // Generate initial data
        console.log('Generating initial data...')
        await this.provider.refresh()

        this.isInitialized = true
        this.error = null
        console.log('Data provider initialized successfully')

        return this.provider
      } catch (error) {
        console.error('Failed to initialize data provider:', error)
        this.error = error.message
        throw error
      }
    },

    async getProvider() {
      if (!this.isInitialized) {
        await this.initialize()
      }
      return this.provider
    },

    async setDataSource(type) {
      try {
        if (!Object.values(DataSourceType).includes(type)) {
          throw new Error(`Invalid data source type: ${type}`)
        }

        console.log('Switching data source to:', type)
        this.currentType = type
        this.isInitialized = false
        this.provider = null

        // Re-initialize with new type
        return await this.initialize()
      } catch (error) {
        console.error('Failed to set data source:', error)
        this.error = error.message
        throw error
      }
    },

    async refreshData() {
      try {
        if (!this.provider) {
          await this.initialize()
        }
        console.log('Refreshing data...')
        await this.provider.refresh()
        console.log('Data refreshed successfully')
      } catch (error) {
        console.error('Failed to refresh data:', error)
        this.error = error.message
        throw error
      }
    },

    clearError() {
      this.error = null
    },
  },
})

// Backward compatibility layer with improved error handling
export function useDataSource() {
  const store = useDataSourceStore()

  return {
    getProvider: async () => {
      try {
        return await store.getProvider()
      } catch (error) {
        console.error('Error getting provider:', error)
        throw error
      }
    },
    setDataSource: async (type) => {
      try {
        return await store.setDataSource(type)
      } catch (error) {
        console.error('Error setting data source:', error)
        throw error
      }
    },
    refreshData: () => store.refreshData(),
    isReady: () => store.isReady,
    hasError: () => store.hasError,
    getError: () => store.error,
    clearError: () => store.clearError(),
  }
}
