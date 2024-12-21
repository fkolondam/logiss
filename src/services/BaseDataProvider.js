/**
 * Base class for data providers that defines the interface
 * All data providers should extend this class and implement these methods
 */
export class BaseDataProvider {
  /**
   * Fetch data from the provider
   * @param {string} resource - The resource to fetch (e.g., 'deliveries', 'expenses', 'vehicles')
   * @param {Object} params - Query parameters (filtering, sorting, pagination, etc.)
   * @returns {Promise<{data: Array, total: number, page: number, limit: number}>}
   * @throws {Error} When not implemented by child class
   */
  async fetch(resource, params = {}) {
    throw new Error(
      `fetch method must be implemented for resource: ${resource}, params: ${JSON.stringify(params)}`,
    )
  }

  /**
   * Create a new resource
   * @param {string} resource - The resource type to create
   * @param {Object} data - The data for the new resource
   * @returns {Promise<Object>}
   * @throws {Error} When not implemented by child class
   */
  async create(resource, data) {
    throw new Error(
      `create method must be implemented for resource: ${resource}, data: ${JSON.stringify(data)}`,
    )
  }

  /**
   * Update an existing resource
   * @param {string} resource - The resource type to update
   * @param {number|string} id - The ID of the resource to update
   * @param {Object} data - The updated data
   * @returns {Promise<Object>}
   * @throws {Error} When not implemented by child class
   */
  async update(resource, id, data) {
    throw new Error(
      `update method must be implemented for resource: ${resource}, id: ${id}, data: ${JSON.stringify(data)}`,
    )
  }

  /**
   * Delete a resource
   * @param {string} resource - The resource type to delete
   * @param {number|string} id - The ID of the resource to delete
   * @returns {Promise<boolean>}
   * @throws {Error} When not implemented by child class
   */
  async delete(resource, id) {
    throw new Error(`delete method must be implemented for resource: ${resource}, id: ${id}`)
  }

  /**
   * Get delivery statistics
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Object>}
   * @throws {Error} When not implemented by child class
   */
  async getDeliveryStats(params = {}) {
    throw new Error(
      `getDeliveryStats method must be implemented with params: ${JSON.stringify(params)}`,
    )
  }

  /**
   * Get expense statistics
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Object>}
   * @throws {Error} When not implemented by child class
   */
  async getExpenseStats(params = {}) {
    throw new Error(
      `getExpenseStats method must be implemented with params: ${JSON.stringify(params)}`,
    )
  }

  /**
   * Get vehicle statistics
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Object>}
   * @throws {Error} When not implemented by child class
   */
  async getVehicleStats(params = {}) {
    throw new Error(
      `getVehicleStats method must be implemented with params: ${JSON.stringify(params)}`,
    )
  }
}
