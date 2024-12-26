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

  // Include period in cache key
  const periodKey = params.period || 'all'

  // Sort and stringify params
  const paramsKey = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return `${resource}:${scopeKey}:${periodKey}:${paramsKey}`
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

export function useDeliveriesData() {
  const userStore = useUserStore()
  const { scope: currentScope } = storeToRefs(userStore)

  // Reactive states
  const isLoading = ref(false)
  const error = ref(null)
  const loadingStates = ref({
    deliveries: false,
    stats: false,
    [PERIODS.TODAY]: false,
    [PERIODS.THIS_WEEK]: false,
    [PERIODS.THIS_MONTH]: false,
  })

  // Data states
  const deliveries = ref([])
  const stats = ref({})
  const currentPeriod = ref(PERIODS.TODAY)

  function getDateRange(period = currentPeriod.value) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (period) {
      case PERIODS.TODAY:
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        }
      case PERIODS.THIS_WEEK:
        const monday = new Date(today)
        monday.setDate(today.getDate() - today.getDay() + 1)
        const sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6)
        return { start: monday, end: sunday }
      case PERIODS.THIS_MONTH:
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        return { start: firstDay, end: lastDay }
      default:
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) }
    }
  }

  async function fetchDeliveries(params = {}) {
    loadingStates.value.deliveries = true
    error.value = null

    try {
      const dateRange = params.dateRange || getDateRange(currentPeriod.value)
      const fetchParams = {
        ...params,
        dateRange: {
          start: dateRange.start.toISOString().split('T')[0],
          end: dateRange.end.toISOString().split('T')[0],
        },
        period: currentPeriod.value,
        sort: 'date,desc',
      }

      // Check cache first
      const cacheKey = getCacheKey('deliveries', currentScope.value, fetchParams)
      let data = getCachedData(cacheKey)

      if (!data) {
        console.log(
          'Fetching deliveries for period:',
          currentPeriod.value,
          'with params:',
          fetchParams,
        )
        const result = await dataProviderFactory.getData('deliveries', currentScope.value, {
          ...fetchParams,
          includeTrends: true,
          includeDetailedStats: true,
        })
        data = result.data
        setCachedData(cacheKey, data)
      }

      deliveries.value = data
    } catch (e) {
      error.value = e.message
      console.error('Error fetching deliveries:', e)
    } finally {
      loadingStates.value.deliveries = false
      updateLoadingState()
    }
  }

  async function fetchStats(params = {}) {
    loadingStates.value.stats = true
    error.value = null

    try {
      const dateRange = params.dateRange || getDateRange(currentPeriod.value)
      const fetchParams = {
        ...params,
        dateRange: {
          start: dateRange.start.toISOString().split('T')[0],
          end: dateRange.end.toISOString().split('T')[0],
        },
        period: currentPeriod.value,
      }

      // Check cache first
      const cacheKey = getCacheKey('stats', currentScope.value, fetchParams)
      let data = getCachedData(cacheKey)

      if (!data) {
        console.log('Fetching stats for period:', currentPeriod.value, 'with params:', fetchParams)
        data = await dataProviderFactory.getStats('deliveries', currentScope.value, {
          ...fetchParams,
          includeTrends: true,
        })
        setCachedData(cacheKey, data)
      }

      stats.value = data
    } catch (e) {
      error.value = e.message
      console.error('Error fetching delivery stats:', e)
    } finally {
      loadingStates.value.stats = false
      updateLoadingState()
    }
  }

  async function refreshData(params = {}) {
    if (isLoading.value) return

    const dateRange = getDateRange(currentPeriod.value)
    loadingStates.value[currentPeriod.value] = true

    try {
      // Clear cache for current period
      const periodParams = {
        dateRange: {
          start: dateRange.start.toISOString().split('T')[0],
          end: dateRange.end.toISOString().split('T')[0],
        },
        period: currentPeriod.value,
      }

      // Clear cache for both deliveries and stats
      const deliveriesCacheKey = getCacheKey('deliveries', currentScope.value, periodParams)
      const statsCacheKey = getCacheKey('stats', currentScope.value, periodParams)
      cache.delete(deliveriesCacheKey)
      cache.delete(statsCacheKey)

      console.log('Refreshing data for period:', currentPeriod.value)
      await Promise.all([
        fetchDeliveries({ ...params, dateRange }),
        fetchStats({ ...params, dateRange }),
      ])
    } finally {
      loadingStates.value[currentPeriod.value] = false
      updateLoadingState()
    }
  }

  function updateLoadingState() {
    isLoading.value = Object.values(loadingStates.value).some(Boolean)
  }

  // Watch for scope changes
  watch(
    () => ({
      type: currentScope.value?.type || 'global',
      value: currentScope.value?.value,
    }),
    (newScope, oldScope) => {
      const scopeChanged = newScope.type !== oldScope?.type || newScope.value !== oldScope?.value

      if (scopeChanged) {
        clearScopedCache(currentScope.value)
        refreshData()
      }
    },
    { immediate: true, deep: true },
  )

  // Watch for period changes
  watch(currentPeriod, (newPeriod, oldPeriod) => {
    if (newPeriod !== oldPeriod) {
      console.log('Period changed from', oldPeriod, 'to', newPeriod)
      refreshData()
    }
  })

  return {
    // States
    isLoading,
    loadingStates,
    error,
    deliveries,
    stats,
    currentPeriod,

    // Methods
    fetchDeliveries,
    fetchStats,
    refreshData,
    getDateRange,
    clearCache: clearScopedCache,
  }
}
