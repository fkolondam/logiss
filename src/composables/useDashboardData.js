import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { dataProviderFactory } from '../services/DataProviderFactory'
import { useUserStore } from '../stores/user'
import { PERIODS } from '../constants/periods'
import {
  processDeliveryStats,
  processExpenseStats,
  processVehicleStats,
} from './useStatsProcessing'

export function useDashboardData() {
  const userStore = useUserStore()
  const { scope: currentScope } = storeToRefs(userStore)

  const isLoading = ref(false)
  const error = ref(null)
  const loadingStates = ref({
    deliveries: false,
    expenses: false,
    vehicles: false,
    [PERIODS.TODAY]: false,
    [PERIODS.THIS_WEEK]: false,
    [PERIODS.THIS_MONTH]: false,
    [PERIODS.LAST_MONTH]: false,
    [PERIODS.L3M]: false,
    [PERIODS.YTD]: false,
    [PERIODS.CUSTOM_RANGE]: false,
  })

  // Cache configuration
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  const cache = ref(new Map())

  const currentPeriod = ref(PERIODS.TODAY)
  const customDateRange = ref([])
  const deliveryStats = ref({})
  const expenseStats = ref({})
  const vehicleStats = ref({})

  // Cache management
  function getCacheKey(section, scope, period) {
    return `${section}:${scope?.type}:${scope?.value}:${period}`
  }

  function getCachedData(section, scope, period) {
    const key = getCacheKey(section, scope, period)
    const cached = cache.value.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Using cached data for ${key}`)
      return cached.data
    }
    return null
  }

  function setCachedData(section, scope, period, data) {
    const key = getCacheKey(section, scope, period)
    cache.value.set(key, {
      data,
      timestamp: Date.now(),
    })
    console.log(`Cached data for ${key}`)
  }

  function clearCache() {
    cache.value.clear()
    console.log('Cache cleared')
  }

  const canAccessDeliveries = computed(() => userStore.hasPermission('read_deliveries'))
  const canAccessExpenses = computed(() => userStore.hasPermission('read_expenses'))
  const canAccessVehicles = computed(() => userStore.hasPermission('read_vehicles'))

  function updateDateRange(range) {
    if (range?.length === 2) {
      customDateRange.value = range
      loadDashboardData()
    }
  }

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
      case PERIODS.LAST_MONTH:
        const lastMonthFirstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const lastMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0)
        return { start: lastMonthFirstDay, end: lastMonthLastDay }
      case PERIODS.L3M:
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1)
        return { start: threeMonthsAgo, end: today }
      case PERIODS.YTD:
        const yearStart = new Date(today.getFullYear(), 0, 1)
        return { start: yearStart, end: today }
      case PERIODS.CUSTOM_RANGE:
        if (customDateRange.value?.length === 2) {
          const [start, end] = customDateRange.value
          // Set time to start of day for start date and end of day for end date
          const startDate = new Date(start)
          startDate.setHours(0, 0, 0, 0)
          const endDate = new Date(end)
          endDate.setHours(23, 59, 59, 999)
          return { start: startDate, end: endDate }
        }
        return { start: today, end: today }
      default:
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) }
    }
  }

  async function loadSectionData(section, params = {}) {
    loadingStates.value[section] = true
    error.value = null

    try {
      const dateRange = getDateRange(currentPeriod.value)
      const fetchParams = {
        ...params,
        dateRange: {
          start: dateRange.start.toISOString().split('T')[0],
          end: dateRange.end.toISOString().split('T')[0],
        },
        period: currentPeriod.value,
        scope: currentScope.value,
      }

      console.log(`Loading ${section} data with params:`, fetchParams)

      // Check cache first
      const cachedData = getCachedData(section, currentScope.value, currentPeriod.value)
      if (cachedData) {
        switch (section) {
          case 'deliveries':
            deliveryStats.value = cachedData
            break
          case 'expenses':
            expenseStats.value = cachedData
            break
          case 'vehicles':
            vehicleStats.value = cachedData
            break
        }
        return
      }

      // Fetch current and previous period data for trend calculation
      const [currentResult, previousResult] = await Promise.all([
        dataProviderFactory.getData(section, currentScope.value, fetchParams),
        loadPreviousPeriodData(section, dateRange, currentScope.value),
      ])

      // Process stats with trend calculations and cache
      let stats
      switch (section) {
        case 'deliveries':
          stats = processDeliveryStats(currentResult)
          if (previousResult?.data) {
            const prevStats = processDeliveryStats(previousResult)
            calculateDeliveryTrends(stats, prevStats)
          }
          deliveryStats.value = stats
          setCachedData(section, currentScope.value, currentPeriod.value, stats)
          break

        case 'expenses':
          stats = processExpenseStats(currentResult)
          if (previousResult?.data) {
            const prevStats = processExpenseStats(previousResult)
            calculateExpenseTrends(stats, prevStats)
          }
          expenseStats.value = stats
          setCachedData(section, currentScope.value, currentPeriod.value, stats)
          break

        case 'vehicles':
          stats = processVehicleStats(currentResult)
          if (previousResult?.data) {
            const prevStats = processVehicleStats(previousResult)
            calculateVehicleTrends(stats, prevStats)
          }
          vehicleStats.value = stats
          setCachedData(section, currentScope.value, currentPeriod.value, stats)
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

  async function loadPreviousPeriodData(section, currentDateRange, scope) {
    const previousDateRange = getPreviousDateRange(currentDateRange)
    try {
      return await dataProviderFactory.getData(section, scope, {
        dateRange: {
          start: previousDateRange.start.toISOString().split('T')[0],
          end: previousDateRange.end.toISOString().split('T')[0],
        },
      })
    } catch (error) {
      console.warn(`Failed to load previous period data for ${section}:`, error)
      return null
    }
  }

  function getPreviousDateRange({ start, end }) {
    const duration = end.getTime() - start.getTime()
    const previousStart = new Date(start.getTime() - duration)
    const previousEnd = new Date(end.getTime() - duration)
    return { start: previousStart, end: previousEnd }
  }

  function calculateDeliveryTrends(currentStats, previousStats) {
    if (!previousStats) return

    currentStats.trend = calculateTrendPercentage(currentStats.total, previousStats.total)

    const currentCompletionRate = (currentStats.receivedAll / currentStats.total) * 100
    const previousCompletionRate = (previousStats.receivedAll / previousStats.total) * 100
    currentStats.completionTrend = Math.round(currentCompletionRate - previousCompletionRate)

    currentStats.receivedTrend = calculateTrendPercentage(
      currentStats.receivedAll,
      previousStats.receivedAll,
    )
    currentStats.partialTrend = calculateTrendPercentage(
      currentStats.partial,
      previousStats.partial,
    )
    currentStats.resendTrend = calculateTrendPercentage(currentStats.resend, previousStats.resend)
    currentStats.cancelledTrend = calculateTrendPercentage(
      currentStats.cancelled,
      previousStats.cancelled,
    )
  }

  function calculateExpenseTrends(currentStats, previousStats) {
    if (!previousStats) return

    currentStats.trend = calculateTrendPercentage(
      currentStats.totalAmount,
      previousStats.totalAmount,
    )

    Object.keys(currentStats.byCategory).forEach((category) => {
      const currentAmount = currentStats.byCategory[category].amount
      const previousAmount = previousStats.byCategory[category]?.amount || 0
      currentStats.byCategory[category].trend = calculateTrendPercentage(
        currentAmount,
        previousAmount,
      )
    })
  }

  function calculateVehicleTrends(currentStats, previousStats) {
    if (!previousStats) return

    currentStats.activeTrend = calculateTrendPercentage(currentStats.active, previousStats.active)
    currentStats.maintenanceTrend = calculateTrendPercentage(
      currentStats.maintenance,
      previousStats.maintenance,
    )
    currentStats.utilizationTrend = calculateTrendPercentage(
      (currentStats.active / currentStats.total) * 100,
      (previousStats.active / previousStats.total) * 100,
    )
  }

  function calculateTrendPercentage(current, previous) {
    if (!previous) return 0
    return Math.round(((current - previous) / previous) * 100)
  }

  async function loadDashboardData() {
    if (isLoading.value) {
      console.log('Already loading dashboard data, skipping')
      return
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('Loading dashboard data for period:', currentPeriod.value)
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
      console.log('Dashboard data loaded successfully')
    } catch (e) {
      error.value = e.message
      console.error('Error loading dashboard data:', e)
    } finally {
      isLoading.value = false
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
      if (newScope.type !== oldScope?.type || newScope.value !== oldScope?.value) {
        clearCache() // Clear cache when scope changes
        loadDashboardData()
      }
    },
    { immediate: true, deep: true },
  )

  let refreshInterval = null

  // Clean up interval on unmount
  onUnmounted(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
  })

  // Initialize with today's data and watch for user/scope changes
  onMounted(async () => {
    // Set initial period to today
    currentPeriod.value = PERIODS.TODAY

    // Initial data load
    await loadDashboardData()

    // Set up auto-refresh interval for cache
    refreshInterval = setInterval(
      () => {
        if (document.visibilityState === 'visible') {
          console.log('Auto-refreshing dashboard data')
          dataProviderFactory.clearCache()
          loadDashboardData()
        }
      },
      5 * 60 * 1000,
    ) // 5 minutes
  })

  // Watch for user changes
  watch(
    () => userStore.currentUser?.id,
    () => {
      console.log('User changed, reloading dashboard data')
      dataProviderFactory.clearCache()
      loadDashboardData()
    },
  )

  // Watch for period changes
  watch(currentPeriod, (newPeriod, oldPeriod) => {
    if (newPeriod !== oldPeriod) {
      loadDashboardData()
    }
  })

  // Watch for custom date range changes
  watch(customDateRange, (newRange) => {
    if (currentPeriod.value === PERIODS.CUSTOM_RANGE && newRange?.length === 2) {
      loadDashboardData()
    }
  })

  return {
    isLoading,
    loadingStates,
    error,
    deliveryStats,
    expenseStats,
    vehicleStats,
    currentPeriod,
    customDateRange,
    PERIODS,
    loadDashboardData,
    loadSectionData,
    getDateRange,
    updateDateRange,
  }
}
