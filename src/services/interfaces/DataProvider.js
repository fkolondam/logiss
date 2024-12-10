/**
 * Interface for data providers
 * All data providers must implement these methods
 */
export class DataProvider {
  constructor() {
    if (this.constructor === DataProvider) {
      throw new Error('Interface cannot be instantiated')
    }
  }

  /**
   * Fetch data from the source
   * @param {string} resource - The resource to fetch (deliveries, expenses, vehicles)
   * @param {Object} params - Query parameters (filter, sort, pagination)
   * @returns {Promise<Array>}
   */
  async fetch(resource, params = {}) {
    throw new Error('Method "fetch" must be implemented')
  }

  /**
   * Create new data
   * @param {string} resource - The resource type
   * @param {Object} data - The data to create
   * @returns {Promise<Object>}
   */
  async create(resource, data) {
    throw new Error('Method "create" must be implemented')
  }

  /**
   * Update existing data
   * @param {string} resource - The resource type
   * @param {number|string} id - The resource ID
   * @param {Object} data - The data to update
   * @returns {Promise<Object>}
   */
  async update(resource, id, data) {
    throw new Error('Method "update" must be implemented')
  }

  /**
   * Delete data
   * @param {string} resource - The resource type
   * @param {number|string} id - The resource ID
   * @returns {Promise<boolean>}
   */
  async delete(resource, id) {
    throw new Error('Method "delete" must be implemented')
  }
}
