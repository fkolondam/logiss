import { computed } from 'vue'
import { useUserStore } from '../stores/user'

/**
 * @typedef {import('../services/interfaces/DataProvider').Scope} Scope
 * @typedef {import('../services/interfaces/AccessControl').User} User
 */

/**
 * Composable for handling access control in components
 * @returns {Object} Access control utilities
 */
export function useAccess() {
  const userStore = useUserStore()

  /**
   * Current user
   * @type {import('vue').ComputedRef<User|null>}
   */
  const currentUser = computed(() => userStore.currentUser)

  /**
   * Current scope
   * @type {import('vue').ComputedRef<Scope|null>}
   */
  const scope = computed(() => userStore.scope)

  /**
   * Check if user has specific permission
   * @param {string} permission Permission to check
   * @returns {boolean}
   */
  const hasPermission = (permission) => userStore.hasPermission(permission)

  /**
   * Check if user can access expense category
   * @param {string} category Expense category
   * @returns {boolean}
   */
  const canAccessExpenseCategory = (category) => userStore.canAccessExpenseCategory(category)

  /**
   * Check if user can modify expense category
   * @param {string} category Expense category
   * @returns {boolean}
   */
  const canModifyExpenseCategory = (category) => userStore.canModifyExpenseCategory(category)

  /**
   * Check if user can access branch
   * @param {string} branchId Branch ID
   * @returns {boolean}
   */
  const canAccessBranch = (branchId) => userStore.canAccessBranch(branchId)

  /**
   * Check if user can access vehicle
   * @param {string} vehicleId Vehicle ID
   * @returns {boolean}
   */
  const canAccessVehicle = (vehicleId) => userStore.canAccessVehicle(vehicleId)

  /**
   * Switch to a different user (for testing)
   * @param {string} userId User ID to switch to
   */
  const switchUser = async (userId) => {
    await userStore.switchUser(userId)
  }

  /**
   * Get scope-filtered data
   * @template T
   * @param {Array<T>} data Data array to filter
   * @param {string} scopeField Field to check for scope (e.g., 'branch', 'region')
   * @returns {Array<T>} Filtered data
   */
  const filterByScope = (data, scopeField) => {
    if (!currentUser.value || !scope.value) return []

    switch (scope.value.type) {
      case 'global':
        return data

      case 'region':
        return data.filter(
          (item) =>
            // TODO: Add region mapping check
            item[scopeField] === scope.value.value,
        )

      case 'branch':
        return data.filter((item) => item[scopeField] === scope.value.value)

      case 'personal':
        return data.filter(
          (item) =>
            item.driver === currentUser.value.name || item.helper === currentUser.value.name,
        )

      default:
        return []
    }
  }

  return {
    currentUser,
    scope,
    hasPermission,
    canAccessExpenseCategory,
    canModifyExpenseCategory,
    canAccessBranch,
    canAccessVehicle,
    switchUser,
    filterByScope,
  }
}
