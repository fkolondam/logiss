export class DataProviderError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = null) {
    super(message)
    this.name = 'DataProviderError'
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
  }

  static createError(type, details = null) {
    const errorTypes = {
      FETCH_ERROR: 'Failed to fetch data',
      UPDATE_ERROR: 'Failed to update data',
      REFRESH_ERROR: 'Failed to refresh data',
      INIT_ERROR: 'Failed to initialize',
      INVALID_RESOURCE: 'Invalid resource requested',
      INVALID_PARAMS: 'Invalid parameters provided',
      DATA_NOT_FOUND: 'Data not found',
      VALIDATION_ERROR: 'Data validation failed',
    }

    return new DataProviderError(errorTypes[type] || errorTypes.UNKNOWN_ERROR, type, details)
  }
}
