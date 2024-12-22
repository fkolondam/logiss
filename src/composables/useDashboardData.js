import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { dataProviderFactory } from '../services/DataProviderFactory'
import { useUserStore } from '../stores/user'
import { PERIODS } from '../constants/periods'

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
    [PERIODS.TODAY]: false,
    [PERIODS.THIS_WEEK]: false,
    [PERIODS.THIS_MONTH]: false,
  })

  // Timeline state
  const currentPeriod = ref(PERIODS.TODAY)

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
      vehicleLicense: 0,
      labour: 0,
      parkingToll: 0,
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
      // For region scope, check region match
      if (scope.type === 'region') {
        return fieldsToCheck.some((field) => item[field] === scope.value)
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
   * Get date range for current period
   */
  function getDateRange(period = currentPeriod.value) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (period) {
      case PERIODS.TODAY:
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1), // End of today
        }
      case PERIODS.THIS_WEEK:
        const monday = new Date(today)
        monday.setDate(today.getDate() - today.getDay() + 1) // Monday
        const sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6) // Sunday
        return { start: monday, end: sunday }
      case PERIODS.THIS_MONTH:
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        return { start: firstDay, end: lastDay }
      default:
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) }
    }
  }

  /**
   * Load data for a specific section with caching
   */
  async function loadSectionData(section, params = {}) {
    loadingStates.value[section] = true
    error.value = null

    try {
      // Get date range and params based on section type
      const dateParams =
        section === 'vehicles'
          ? { ...params } // Vehicles don't use timeline filtering
          : {
              ...params,
              dateRange: params.dateRange
                ? {
                    start: new Date(params.dateRange.start).toISOString().split('T')[0],
                    end: new Date(params.dateRange.end).toISOString().split('T')[0],
                  }
                : {
                    start: getDateRange(currentPeriod.value).start.toISOString().split('T')[0],
                    end: getDateRange(currentPeriod.value).end.toISOString().split('T')[0],
                  },
              period: currentPeriod.value,
            }

      // Check cache first
      const cacheKey = getCacheKey(section, currentScope.value, dateParams)
      let data = getCachedData(cacheKey)

      if (!data) {
        // Fetch fresh data with trends and detailed stats
        const result = await dataProviderFactory.getData(section, currentScope.value, {
          ...dateParams,
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
              ...dateParams,
              includeTrends: true,
              period: currentPeriod.value,
            },
          )
          deliveryStats.value = {
            ...deliveryStatsData,
            completionRate: calculateCompletionRate(deliveryStatsData),
          }
          break
        case 'expenses':
          expenseStats.value = await dataProviderFactory.getStats('expenses', currentScope.value, {
            ...dateParams,
            includeTrends: true,
            period: currentPeriod.value,
          })
          break
        case 'vehicles':
          const vehicleStatsData = await dataProviderFactory.getStats(
            'vehicles',
            currentScope.value,
            {
              ...dateParams,
              includeTrends: true,
              period: currentPeriod.value,
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

    // Set loading states
    loadingStates.value[currentPeriod.value] = true
    loadingStates.value.deliveries = true
    loadingStates.value.expenses = true
    loadingStates.value.vehicles = true

    try {
      const loadPromises = []

      // Get date range for timeline-based sections
      const { start, end } = getDateRange(currentPeriod.value)
      const dateParams = {
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        },
      }

      // Load timeline-based sections
      if (canAccessDeliveries.value) {
        loadPromises.push(loadSectionData('deliveries', dateParams))
      }
      if (canAccessExpenses.value) {
        loadPromises.push(loadSectionData('expenses', dateParams))
      }

      // Load vehicles without timeline filtering
      if (canAccessVehicles.value) {
        loadPromises.push(loadSectionData('vehicles', {}))
      }

      await Promise.all(loadPromises)
    } catch (e) {
      error.value = e.message
      console.error('Error loading dashboard data:', e)
    } finally {
      // Clear loading states
      loadingStates.value[currentPeriod.value] = false
      loadingStates.value.deliveries = false
      loadingStates.value.expenses = false
      loadingStates.value.vehicles = false
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

  // Watch for period changes and reload data
  watch(currentPeriod, (newPeriod, oldPeriod) => {
    if (newPeriod !== oldPeriod) {
      // Clear cache when period changes
      cache.clear()
      // Reload dashboard data with new period
      loadDashboardData()
      console.log(`Period changed from ${oldPeriod} to ${newPeriod}`)
    }
  })

  return {
    // States
    isLoading,
    loadingStates,
    error,

    // Data
    deliveryStats,
    expenseStats,
    vehicleStats,

    // Timeline
    currentPeriod,
    PERIODS,

    // Methods
    loadDashboardData,
    refreshSection,
    getDateRange,
  }
}
