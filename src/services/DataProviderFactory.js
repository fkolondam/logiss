import { MockDataProvider } from './MockDataProvider'
import { MySQLProvider } from './providers/MySQLProvider'
import { GoogleSheetsProvider } from './providers/GoogleSheetsProvider'

export const DataSourceType = {
  MOCK: 'mock',
  MYSQL: 'mysql',
  GOOGLE_SHEETS: 'google_sheets'
}

export class DataProviderFactory {
  static instance = null
  static currentProvider = null
  static currentType = DataSourceType.MOCK // Default to mock data

  static getInstance() {
    if (!DataProviderFactory.instance) {
      DataProviderFactory.instance = new DataProviderFactory()
    }
    return DataProviderFactory.instance
  }

  getProvider(type = null) {
    // If no type specified, return current provider or create default
    if (!type) {
      if (DataProviderFactory.currentProvider) {
        return DataProviderFactory.currentProvider
      }
      type = DataProviderFactory.currentType
    }

    // If switching providers, create new instance
    if (type !== DataProviderFactory.currentType || !DataProviderFactory.currentProvider) {
      switch (type) {
        case DataSourceType.MYSQL:
          DataProviderFactory.currentProvider = new MySQLProvider()
          break
        case DataSourceType.GOOGLE_SHEETS:
          DataProviderFactory.currentProvider = new GoogleSheetsProvider()
          break
        case DataSourceType.MOCK:
        default:
          DataProviderFactory.currentProvider = new MockDataProvider()
          break
      }
      DataProviderFactory.currentType = type
    }

    return DataProviderFactory.currentProvider
  }

  getCurrentSourceType() {
    return DataProviderFactory.currentType
  }

  setDataSource(type) {
    if (!Object.values(DataSourceType).includes(type)) {
      throw new Error(`Invalid data source type: ${type}`)
    }
    DataProviderFactory.currentType = type
    DataProviderFactory.currentProvider = null // Force new instance on next get
    return this.getProvider(type)
  }
}

// Export singleton instance
export const dataProviderFactory = DataProviderFactory.getInstance()
