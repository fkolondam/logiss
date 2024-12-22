/**
 * Wrapper to add scope-based filtering to any data provider
 */
export class AccessControlWrapper {
  constructor(provider, userStore) {
    this.provider = provider
    this.userStore = userStore
  }

  /**
   * Get params based on current user's scope
   * @returns {Object} Scope-based params for provider
   */
  getScopeParams() {
    const scope = this.userStore.scope
    if (!scope) return {}

    switch (scope.type) {
      case 'global':
        return {}
      case 'region':
        return { region: scope.value }
      case 'branch':
        return { branch: scope.value }
      case 'personal':
        return {
          filter: {
            driver: this.userStore.currentUser?.name,
          },
        }
      default:
        return {}
    }
  }

  /**
   * Fetch data with automatic scope filtering
   * @param {string} resource - Resource name
   * @param {Object} params - Additional query parameters
   */
  async fetch(resource, params = {}) {
    const scopeParams = this.getScopeParams()
    return this.provider.fetch(resource, {
      ...params,
      ...scopeParams,
    })
  }

  /**
   * Get stats with automatic scope filtering
   * @param {string} resource - Resource name
   * @param {Object} params - Additional parameters
   */
  async getStats(resource, params = {}) {
    const scopeParams = this.getScopeParams()

    switch (resource) {
      case 'deliveries':
        return this.provider.getDeliveryStats({
          ...params,
          ...scopeParams,
        })
      case 'expenses':
        return this.provider.getExpenseStats({
          ...params,
          ...scopeParams,
        })
      case 'vehicles':
        return this.provider.getVehicleStats({
          ...params,
          ...scopeParams,
        })
      default:
        return this.provider.getStats(resource, {
          ...params,
          ...scopeParams,
        })
    }
  }
}
