import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { dataProviderFactory } from '../services/DataProviderFactory'
import { useUserStore } from '../stores/user'

// Cache implementation
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const cache = new Map()

function getCacheKey(resource, scope, params = {}) {
  // Generate scope key based on hierarchy
  let scopeKey = 'global'
  if (scope) {
    switch (scope.type) {
      case 'region':
        scopeKey = `region-${scope.value}`
        break
      case 'branch':
        // Include region in branch cache key for proper invalidation
        const region = scope.value.split(' ')[1] // Extract region from branch name (e.g., "RDA SUMEDANG" -> "SUMEDANG")
        scopeKey = `branch-${scope.value}-region-${region}`
        break
      case 'personal':
        scopeKey = `personal-${scope.value}`
        break
      default:
        scopeKey = 'global'
    }
  }

  // Sort and stringify params
  const paramsKey = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return `${resource}:${scopeKey}:${paramsKey}`
}

function clearScopedCache(scope) {
  // Clear all cache entries that match the scope hierarchy
  for (const key of cache.keys()) {
    if (scope.type === 'region') {
      // Clear all cache entries for this region and its branches
      if (key.includes(`region-${scope.value}`) || key.includes(`branch-RDA ${scope.value}`)) {
        cache.delete(key)
      }
    } else if (scope.type === 'branch') {
      // Clear branch cache and related personal caches
      if (key.includes(`branch-${scope.value}`) || key.startsWith('personal-')) {
        cache.delete(key)
      }
    } else if (scope.type === 'personal') {
      // Clear only personal cache
      if (key.includes(`personal-${scope.value}`)) {
        cache.delete(key)
      }
    } else {
      // Global scope change clears everything
      cache.clear()
      break
    }
  }
}

function getCachedData(key) {
  const cached = cache.get(key)
  if (!cached) return null

  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION
  if (isExpired) {
    cache.delete(key)
    return null
  }

  return cached.data
}

function setCachedData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  })
}

export function useDashboardData() {
  const userStore = useUserStore()
  const { scope: currentScope } = storeToRefs(userStore)

  // Reactive states
  const isLoading = ref(false)
  const error = ref(null)
  const loadingStates = ref({
    deliveries: false,
    expenses: false,
    vehicles: false,
  })

  // Permission checks
  const canAccessDeliveries = computed(() => userStore.hasPermission('read_deliveries'))
  const canAccessExpenses = computed(() => userStore.hasPermission('read_expenses'))
  const canAccessVehicles = computed(() => userStore.hasPermission('read_vehicles'))

  // Enhanced stats with trends and detailed breakdowns
  const deliveryStats = ref({
    total: 0,
    completed: 0,
    pending: 0,
    inTransit: 0,
    cancelled: 0,
    trend: 0, // Percentage change from previous period
    completionTrend: 0, // Trend in completion rate
    completionRate: 0, // Current completion rate
    byStatus: {
      completed: 0,
      pending: 0,
      inTransit: 0,
      cancelled: 0,
    },
  })

  const expenseStats = ref({
    total: 0,
    approved: 0,
    pending: 0,
    trend: 0, // Percentage change from previous period
    categories: {
      fuel: 0,
      maintenance: 0,
      insurance: 0,
      others: 0,
    },
  })

  const vehicleStats = ref({
    total: 0,
    active: 0,
    maintenance: 0,
    lowFuel: 0,
    utilizationRate: 0,
    maintenanceRate: 0,
    utilizationTrend: 0, // Trend in utilization rate
    maintenanceTrend: 0, // Trend in maintenance rate
    byStatus: {
      active: 0,
      maintenance: 0,
      inactive: 0,
    },
    byFuelLevel: {
      low: 0,
      medium: 0,
      high: 0,
    },
  })

  /**
   * Filter data based on current scope
   */
  function filterDataByScope(data, type) {
    // Return early if no data or scope
    if (!data || !Array.isArray(data) || !currentScope.value) {
      return data
    }

    const scope = currentScope.value

    // No filtering needed for global scope
    if (!scope || scope.type === 'global') {
      return data
    }

    const filterFields = {
      deliveries: {
        region: 'region',
        branch: 'branch',
        personal: 'driverId',
        hierarchy: {
          region: ['region', 'branch'], // Region can see all branches within region
          branch: ['branch'], // Branch only sees own data
          personal: ['driverId'], // Personal only sees own data
        },
      },
      expenses: {
        region: 'region',
        branch: 'branch',
        personal: 'userId',
        hierarchy: {
          region: ['region', 'branch'],
          branch: ['branch'],
          personal: ['userId'],
        },
      },
      vehicles: {
        region: 'assignedRegion',
        branch: 'assignedBranch',
        personal: 'assignedDriverId',
        hierarchy: {
          region: ['assignedRegion', 'assignedBranch'],
          branch: ['assignedBranch'],
          personal: ['assignedDriverId'],
        },
      },
    }

    const typeConfig = filterFields[type]
    if (!typeConfig) return data

    // Get hierarchical fields to check based on scope type
    const fieldsToCheck = typeConfig.hierarchy[scope.type]
    if (!fieldsToCheck) return data

    return data.filter((item) => {
      // For region scope, check both region match and branch prefix
      if (scope.type === 'region') {
        return fieldsToCheck.some((field) => {
          if (field.includes('branch')) {
            return item[field] && item[field].startsWith(scope.value)
          }
          return item[field] === scope.value
        })
      }

      // For other scopes, exact match on the primary field
      return item[typeConfig[scope.type]] === scope.value
    })
  }

  /**
   * Get filtered stats based on scope
   */
  function getFilteredStats(stats, type) {
    if (!stats || !currentScope.value) return stats

    const scope = currentScope.value
    const filtered = { ...stats }

    // Filter status counts
    if (filtered.byStatus) {
      Object.keys(filtered.byStatus).forEach((status) => {
        const items = filtered.byStatus[status]
        if (Array.isArray(items)) {
          filtered.byStatus[status] = filterDataByScope(items, type).length
        }
      })
    }

    // Filter category amounts for expenses
    if (type === 'expenses' && filtered.categories) {
      Object.keys(filtered.categories).forEach((category) => {
        const items = filtered.categories[category]
        if (Array.isArray(items)) {
          filtered.categories[category] = filterDataByScope(items, type).reduce(
            (sum, item) => sum + (item.amount || 0),
            0,
          )
        }
      })
    }

    return filtered
  }

  /**
   * Load data for a specific section with caching
   */
  async function loadSectionData(section, params = {}) {
    loadingStates.value[section] = true
    error.value = null

    try {
      // Check cache first
      const cacheKey = getCacheKey(section, currentScope.value, params)
      let data = getCachedData(cacheKey)

      if (!data) {
        // Fetch fresh data with trends and detailed stats
        const result = await dataProviderFactory.getData(section, currentScope.value, {
          ...params,
          includeTrends: true,
          includeDetailedStats: true,
          sort: 'date,desc',
        })

        // Filter data based on scope
        data = filterDataByScope(result.data, section)
        setCachedData(cacheKey, data)
      }

      // Update reactive refs with enhanced stats
      switch (section) {
        case 'deliveries':
          const deliveryStatsData = await dataProviderFactory.getStats(
            'deliveries',
            currentScope.value,
            {
              ...params,
              includeTrends: true,
            },
          )
          deliveryStats.value = {
            ...deliveryStatsData,
            completionRate: calculateCompletionRate(deliveryStatsData),
          }
          break
        case 'expenses':
          expenseStats.value = await dataProviderFactory.getStats('expenses', currentScope.value, {
            ...params,
            includeTrends: true,
          })
          break
        case 'vehicles':
          const vehicleStatsData = await dataProviderFactory.getStats(
            'vehicles',
            currentScope.value,
            {
              ...params,
              includeTrends: true,
            },
          )
          vehicleStats.value = {
            ...vehicleStatsData,
            utilizationRate: calculateUtilizationRate(vehicleStatsData),
            maintenanceRate: calculateMaintenanceRate(vehicleStatsData),
          }
          break
      }
    } catch (e) {
      error.value = e.message
      console.error(`Error loading ${section} data:`, e)
    } finally {
      loadingStates.value[section] = false
      updateLoadingState()
    }
  }

  // Helper functions for calculating rates
  function calculateCompletionRate(stats) {
    return stats.total ? Math.round((stats.completed / stats.total) * 100) : 0
  }

  function calculateUtilizationRate(stats) {
    return stats.total ? Math.round((stats.active / stats.total) * 100) : 0
  }

  function calculateMaintenanceRate(stats) {
    return stats.total ? Math.round((stats.maintenance / stats.total) * 100) : 0
  }

  /**
   * Load all dashboard data
   */
  async function loadDashboardData() {
    isLoading.value = true
    error.value = null

    try {
      const loadPromises = []

      if (canAccessDeliveries.value) {
        loadPromises.push(loadSectionData('deliveries'))
      }

      if (canAccessExpenses.value) {
        loadPromises.push(loadSectionData('expenses'))
      }

      if (canAccessVehicles.value) {
        loadPromises.push(loadSectionData('vehicles'))
      }

      await Promise.all(loadPromises)
    } catch (e) {
      error.value = e.message
      console.error('Error loading dashboard data:', e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Refresh specific data section
   */
  async function refreshSection(section, params = {}) {
    // Clear cache based on section and current scope
    if (currentScope.value) {
      const cacheKey = getCacheKey(section, currentScope.value, {})
      for (const key of cache.keys()) {
        if (key.startsWith(cacheKey)) {
          cache.delete(key)
        }
      }
    } else {
      // If no scope, clear all cache entries for this section
      for (const key of cache.keys()) {
        if (key.startsWith(`${section}:`)) {
          cache.delete(key)
        }
      }
    }

    // Reload section data
    await loadSectionData(section, params)

    console.log(
      `Refreshed ${section} data for scope ${currentScope.value?.type}:${currentScope.value?.value}`,
    )
  }

  /**
   * Update global loading state based on section states
   */
  function updateLoadingState() {
    isLoading.value = Object.values(loadingStates.value).some(Boolean)
  }

  // Watch for scope changes and reload data
  watch(
    () => ({
      type: currentScope.value?.type || 'global',
      value: currentScope.value?.value,
    }),
    (newScope, oldScope) => {
      const scopeChanged = newScope.type !== oldScope?.type || newScope.value !== oldScope?.value

      if (scopeChanged) {
        // Clear scoped cache based on hierarchy
        if (currentScope.value) {
          clearScopedCache(currentScope.value)
        } else {
          cache.clear() // Clear all cache if scope is removed
        }

        // Reload dashboard data with new scope
        loadDashboardData()

        console.log(
          `Scope changed from ${oldScope?.type}:${oldScope?.value} to ${newScope.type}:${newScope.value}`,
        )
      }
    },
    {
      immediate: true,
      deep: true,
    },
  )

  return {
    // States
    isLoading,
    loadingStates,
    error,

    // Data
    deliveryStats,
    expenseStats,
    vehicleStats,

    // Methods
    loadDashboardData,
    refreshSection,
  }
}
