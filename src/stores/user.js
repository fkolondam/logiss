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
      branches: [],
      regions: [],
      currentBranch: null,
      currentRegion: null,
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
    userRegion() {
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
    setBranches(branches) {
      this.branches = branches
    },
    setRegions(regions) {
      this.regions = regions
    },
    setCurrentBranch(branch) {
      this.currentBranch = branch
    },
    setCurrentRegion(region) {
      this.currentRegion = region
    },
    clearScope() {
      this.selectedScope = null
    },
    clearUser() {
      this.currentUser = null
      this.selectedScope = null
      this.error = null
    },
  },
})
