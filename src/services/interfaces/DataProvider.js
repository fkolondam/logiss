/**
 * @typedef {'global' | 'region' | 'branch' | 'personal'} AccessLevel
 *
 * @typedef {Object} Scope
 * @property {AccessLevel} type - Access level type
 * @property {string} [value] - Scope value (e.g., branch name, region name)
 */

/**
 * @typedef {Object} QueryParams
 * @property {Object} [filter] - Filter criteria
 * @property {string} [sort] - Sort criteria (field,direction)
 * @property {number} [page] - Page number
 * @property {number} [limit] - Items per page
 * @property {string} [search] - Search term
 * @property {Object} [dateRange] - Date range filter
 */

/**
 * @typedef {Object} QueryResult
 * @property {Array} data - Result data
 * @property {number} total - Total count
 * @property {number} [page] - Current page
 * @property {number} [limit] - Items per page
 */

/**
 * Data Provider Interface
 * @interface
 */
class DataProviderInterface {
  /**
   * Fetch data with scope-based filtering
   * @param {string} resource - Resource name (e.g., 'deliveries', 'expenses')
   * @param {Scope} scope - Access scope
   * @param {QueryParams} [params] - Query parameters
   * @returns {Promise<QueryResult>}
   */
  async fetchWithScope(resource, scope, params = {}) {
    throw new Error('Not implemented')
  }

  /**
   * Get aggregated stats with scope
   * @param {string} resource - Resource name
   * @param {Scope} scope - Access scope
   * @param {Object} [options] - Aggregation options
   * @returns {Promise<Object>}
   */
  async getStats(resource, scope, options = {}) {
    throw new Error('Not implemented')
  }

  /**
   * Legacy fetch method for backward compatibility
   * @param {string} resource - Resource name
   * @param {QueryParams} [params] - Query parameters
   * @returns {Promise<QueryResult>}
   */
  async fetch(resource, params = {}) {
    throw new Error('Not implemented')
  }
}

export { DataProviderInterface as DataProvider }
