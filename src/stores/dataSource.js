import { defineStore } from 'pinia'
import { dataProviderFactory, DataSourceType } from '@/services/DataProviderFactory'

export const useDataSourceStore = defineStore('dataSource', {
  state: () => ({
    currentSource: DataSourceType.MOCK,
    loading: false,
    error: null
  }),

  getters: {
    provider: (state) => dataProviderFactory.getProvider(state.currentSource),
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    errorMessage: (state) => state.error
  },

  actions: {
    async switchDataSource(sourceType) {
      this.loading = true
      this.error = null
      
      try {
        // Validate source type
        if (!Object.values(DataSourceType).includes(sourceType)) {
          throw new Error(`Invalid data source type: ${sourceType}`)
        }

        // Switch the data source
        this.currentSource = sourceType
        dataProviderFactory.setDataSource(sourceType)

        // Test the connection
        await this.testConnection()
      } catch (error) {
        this.error = error.message
        // Fallback to mock data if connection fails
        this.currentSource = DataSourceType.MOCK
        dataProviderFactory.setDataSource(DataSourceType.MOCK)
      } finally {
        this.loading = false
      }
    },

    async testConnection() {
      try {
        // Try to fetch a small amount of data to test the connection
        await this.provider.fetch('deliveries', { limit: 1 })
      } catch (error) {
        throw new Error(`Connection test failed: ${error.message}`)
      }
    },

    clearError() {
      this.error = null
    }
  }
})
