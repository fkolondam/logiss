import { defineStore } from 'pinia'
import { DataProviderFactory, DataSourceType } from '../services/DataProviderFactory'

export const useDataSourceStore = defineStore('dataSource', {
  state: () => ({
    provider: null,
    factory: DataProviderFactory.getInstance(),
    currentType: DataSourceType.MOCK,
  }),
  actions: {
    async getProvider() {
      if (!this.provider) {
        this.provider = this.factory.getProvider(this.currentType)
      }
      return this.provider
    },
    async setDataSource(type) {
      if (!Object.values(DataSourceType).includes(type)) {
        throw new Error(`Invalid data source type: ${type}`)
      }
      this.currentType = type
      this.provider = this.factory.setDataSource(type)
      return this.provider
    },
  },
})

// Backward compatibility layer
export function useDataSource() {
  const store = useDataSourceStore()
  return {
    getProvider: () => store.getProvider(),
    setDataSource: (type) => store.setDataSource(type),
  }
}
