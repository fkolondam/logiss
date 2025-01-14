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
      initialized: false,
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

      // Set initial scope based on user role
      if (!this.initialized) {
        this.selectedScope = user.scope
        this.initialized = true
      } else {
        this.selectedScope = null
      }

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
    async setScope(scope) {
      // Validate scope before setting
      if (this.canSelectScope(scope)) {
        console.log('Setting scope:', scope)
        this.selectedScope = scope
        return true
      } else {
        console.warn('Invalid scope selection:', scope)
        return false
      }
    },

    async clearScope() {
      console.log('Clearing scope')
      if (this.selectedScope) {
        this.selectedScope = null
      }
    },

    clearUser() {
      this.currentUser = null
      this.selectedScope = null
      this.error = null
    },

    canSelectScope(scope) {
      if (!this.currentUser) return false

      switch (this.currentUser.role) {
        case 'admin':
          return true // Admin can select any scope
        case 'regional_manager':
          // Can select global, their region, or branches in their region
          return (
            scope.type === 'global' ||
            (scope.type === 'region' && scope.value === this.currentUser.scope.value) ||
            (scope.type === 'branch' && this.accessibleBranches.includes(scope.value))
          )
        case 'branch_manager':
        case 'staff':
          // Can only select their branch
          return scope.type === 'branch' && scope.value === this.currentUser.scope.value
        case 'operational':
          // Can only select personal scope
          return scope.type === 'personal' && scope.value === this.currentUser.scope.value
        default:
          return false
      }
    },
  },
})
