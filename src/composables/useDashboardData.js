import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { dataProviderFactory } from '../services/DataProviderFactory'
import { useUserStore } from '../stores/user'

// Cache implementation
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const cache = new Map()

function getCacheKey(resource, scope, params = {}) {
  const scopeKey = scope ? `${scope.type}-${scope.value || 'all'}` : 'global'
  const paramsKey = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
  return `${resource}:${scopeKey}:${paramsKey}`
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
    if (!currentScope.value || currentScope.value.type === 'global') {
      return data
    }

    const scope = currentScope.value
    let filterField = ''

    switch (type) {
      case 'deliveries':
        filterField = scope.type === 'region' ? 'region' : 'branch'
        break
      case 'expenses':
        filterField = scope.type === 'region' ? 'region' : 'branch'
        break
      case 'vehicles':
        filterField = scope.type === 'region' ? 'assignedRegion' : 'assignedBranch'
        break
      default:
        return data
    }

    return data.filter((item) => item[filterField] === scope.value)
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
    // Clear cache for this section
    for (const key of cache.keys()) {
      if (key.startsWith(section)) {
        cache.delete(key)
      }
    }

    await loadSectionData(section, params)
  }

  /**
   * Update global loading state based on section states
   */
  function updateLoadingState() {
    isLoading.value = Object.values(loadingStates.value).some(Boolean)
  }

  // Watch for scope changes and reload data
  watch(
    currentScope,
    (newScope, oldScope) => {
      if (
        newScope &&
        (!oldScope || newScope.type !== oldScope.type || newScope.value !== oldScope.value)
      ) {
        // Clear cache when scope changes
        cache.clear()
        loadDashboardData()
      }
    },
    { immediate: true },
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
