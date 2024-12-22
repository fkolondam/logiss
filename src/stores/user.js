import { defineStore } from 'pinia'
import { predefinedUsers, roles, expensePermissions } from '../config/users'

/**
 * @typedef {import('../services/interfaces/AccessControl').User} User
 * @typedef {import('../services/interfaces/DataProvider').Scope} Scope
 */

export const useUserStore = defineStore('user', {
  state: () => ({
    /** @type {User|null} */
    currentUser: null,
    /** @type {Scope|null} */
    selectedScope: null,
    /** @type {string|null} */
    error: null,
  }),

  getters: {
    /**
     * Get current scope (selected or user's default)
     * @returns {Scope|null}
     */
    scope: (state) => state.selectedScope || state.currentUser?.scope || null,

    /**
     * Get current user's role configuration
     * @returns {Object|null}
     */
    roleConfig: (state) => (state.currentUser ? roles[state.currentUser.role] : null),

    /**
     * Check if user has specific permission
     * @returns {function(string): boolean}
     */
    hasPermission: (state) => (permission) => {
      if (!state.currentUser) return false
      const userRole = roles[state.currentUser.role]
      return userRole.permissions.includes('all') || userRole.permissions.includes(permission)
    },

    /**
     * Check if user can access specific expense category
     * @returns {function(string): boolean}
     */
    canAccessExpenseCategory: (state) => (category) => {
      if (!state.currentUser) return false

      // Admin and managers can access all categories
      if (['admin', 'regional_manager', 'branch_manager'].includes(state.currentUser.role)) {
        return true
      }

      // Staff can view but not modify
      if (state.currentUser.role === 'staff') {
        return true
      }

      // Operational users can only access their allowed categories
      if (state.currentUser.role === 'operational') {
        return expensePermissions.operational.includes(category)
      }

      return false
    },

    /**
     * Check if user can modify specific expense category
     * @returns {function(string): boolean}
     */
    canModifyExpenseCategory: (state) => (category) => {
      if (!state.currentUser) return false

      // Admin and managers can modify all categories
      if (['admin', 'regional_manager', 'branch_manager'].includes(state.currentUser.role)) {
        return true
      }

      // Operational users can only modify their allowed categories
      if (state.currentUser.role === 'operational') {
        return expensePermissions.operational.includes(category)
      }

      return false
    },

    /**
     * Check if user can select a specific scope
     * @returns {function(Scope): boolean}
     */
    canSelectScope: (state) => (scope) => {
      if (!state.currentUser) return false
      const userRole = roles[state.currentUser.role]

      switch (userRole.level) {
        case 'global':
          return true
        case 'region':
          return (
            scope.type === 'global' ||
            (scope.type === 'region' && scope.value === state.currentUser.scope.value) ||
            (scope.type === 'branch' && scope.value.startsWith(state.currentUser.scope.value))
          )
        case 'branch':
          return scope.type === 'branch' && scope.value === state.currentUser.scope.value
        case 'personal':
          return scope.type === 'personal' && scope.value === state.currentUser.scope.value
        default:
          return false
      }
    },
  },

  actions: {
    /**
     * Switch to a different user
     * @param {string} userId
     * @returns {Promise<void>}
     */
    async switchUser(userId) {
      const user = predefinedUsers.find((u) => u.id === userId)
      if (!user) {
        this.error = `User ${userId} not found`
        return
      }

      this.currentUser = user
      this.selectedScope = null // Reset scope when switching users
      this.error = null
    },

    /**
     * Set selected scope
     * @param {Scope} scope
     */
    setScope(scope) {
      if (this.canSelectScope(scope)) {
        this.selectedScope = scope
      }
    },

    /**
     * Clear selected scope (revert to user's default scope)
     */
    clearScope() {
      this.selectedScope = null
    },

    /**
     * Clear current user
     */
    clearUser() {
      this.currentUser = null
      this.selectedScope = null
      this.error = null
    },

    /**
     * Check if user can access specific branch
     * @param {string} branchId
     * @returns {boolean}
     */
    canAccessBranch(branchId) {
      if (!this.currentUser) return false

      switch (this.scope.type) {
        case 'global':
          return true
        case 'region':
          // TODO: Check if branch is in user's region
          return true
        case 'branch':
          return this.scope.value === branchId
        case 'personal':
          // Operational users can only access their assigned branch
          return this.scope.value === branchId
        default:
          return false
      }
    },

    /**
     * Check if user can access specific vehicle
     * @param {string} vehicleId
     * @returns {boolean}
     */
    canAccessVehicle(vehicleId) {
      if (!this.currentUser) return false

      switch (this.scope.type) {
        case 'global':
        case 'region':
        case 'branch':
          return true
        case 'personal':
          // TODO: Check if vehicle is assigned to user
          return true
        default:
          return false
      }
    },
  },
})
