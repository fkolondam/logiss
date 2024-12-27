import { defineStore } from 'pinia'
import {
  predefinedUsers,
  roles,
  expensePermissions,
  viewAccess,
  dashboardConfig,
  regionBranches,
} from '../config/users'

export const useUserStore = defineStore('user', {
  state() {
    return {
      currentUser: null,
      selectedScope: null,
      error: null,
    }
  },

  getters: {
    scope() {
      return this.selectedScope || this.currentUser?.scope || null
    },

    roleConfig() {
      return this.currentUser ? roles[this.currentUser.role] : null
    },

    dashboardConfig() {
      return this.currentUser ? dashboardConfig[this.currentUser.role] : null
    },

    viewAccess() {
      return this.currentUser ? viewAccess : null
    },

    accessibleBranches() {
      if (!this.currentUser) return []

      switch (this.currentUser.role) {
        case 'admin':
          return Object.values(regionBranches).flat()
        case 'regional_manager':
          return regionBranches[this.currentUser.scope.value] || []
        case 'branch_manager':
        case 'staff':
          return [this.currentUser.scope.value]
        case 'operational':
          return [this.currentUser.branch]
        default:
          return []
      }
    },

    currentRegion() {
      if (!this.currentUser) return null

      switch (this.currentUser.role) {
        case 'regional_manager':
          return this.currentUser.scope.value
        case 'branch_manager':
        case 'staff':
        case 'operational':
          return this.currentUser.region
        default:
          return null
      }
    },

    hasPermission() {
      return (permission) => {
        if (!this.currentUser) return false
        const userRole = roles[this.currentUser.role]
        return userRole.permissions.includes('all') || userRole.permissions.includes(permission)
      }
    },

    canAccessView() {
      return (viewName) => {
        if (!this.currentUser) return false
        const role = this.currentUser.role
        return viewAccess[viewName]?.[role] || false
      }
    },

    shouldUsePersonalDashboard() {
      return this.currentUser?.role === 'operational' || false
    },

    assignedVehicle() {
      if (!this.currentUser || this.currentUser.role !== 'operational') return null
      return this.currentUser.assignedVehicle || null
    },
  },

  actions: {
    async switchUser(userId) {
      const user = predefinedUsers.find((u) => u.id === userId)
      if (!user) {
        this.error = `User ${userId} not found`
        return
      }

      this.currentUser = user
      this.selectedScope = null
      this.error = null
    },

    setScope(scope) {
      if (this.canSelectScope(scope)) {
        this.selectedScope = scope
      }
    },

    clearScope() {
      this.selectedScope = null
    },

    clearUser() {
      this.currentUser = null
      this.selectedScope = null
      this.error = null
    },

    canAccessBranch(branchId) {
      if (!this.currentUser) return false

      switch (this.currentUser.role) {
        case 'admin':
          return true
        case 'regional_manager':
          return regionBranches[this.currentUser.scope.value]?.includes(branchId)
        case 'branch_manager':
        case 'staff':
          return this.currentUser.scope.value === branchId
        case 'operational':
          return this.currentUser.branch === branchId
        default:
          return false
      }
    },

    canAccessVehicle(vehicleId) {
      if (!this.currentUser) return false

      switch (this.currentUser.role) {
        case 'admin':
          return true
        case 'regional_manager':
          return true // TODO: Implement vehicle-to-branch mapping check
        case 'branch_manager':
        case 'staff':
          return true // TODO: Implement vehicle-to-branch mapping check
        case 'operational':
          return vehicleId === this.currentUser.assignedVehicle
        default:
          return false
      }
    },

    canSelectScope(scope) {
      if (!this.currentUser) return false

      switch (this.currentUser.role) {
        case 'admin':
          return true
        case 'regional_manager':
          return (
            scope.type === 'global' ||
            (scope.type === 'region' && scope.value === this.currentUser.scope.value) ||
            (scope.type === 'branch' &&
              regionBranches[this.currentUser.scope.value]?.includes(scope.value))
          )
        case 'branch_manager':
        case 'staff':
          return scope.type === 'branch' && scope.value === this.currentUser.scope.value
        case 'operational':
          return scope.type === 'personal' && scope.value === this.currentUser.scope.value
        default:
          return false
      }
    },

    getBranchesInRegion(region) {
      return regionBranches[region] || []
    },

    getRegionForBranch(branch) {
      for (const [region, branches] of Object.entries(regionBranches)) {
        if (branches.includes(branch)) {
          return region
        }
      }
      return null
    },
  },
})
