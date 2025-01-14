import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { dataProviderFactory } from '../services/DataProviderFactory'
import { useUserStore } from '../stores/user'
import { PERIODS } from '../constants/periods'
import {
  processDeliveryStats,
  processExpenseStats,
  processVehicleStats,
} from './useStatsProcessing'

function getJakartaDate(date = new Date()) {
  // Create a new date object to avoid modifying the input
  const d = new Date(date)
  // Add 7 hours to get Jakarta time
  d.setHours(d.getHours() + 7)
  return d
}

function getJakartaToday() {
  const jakartaDate = getJakartaDate()
  // Reset time to midnight
  jakartaDate.setHours(0, 0, 0, 0)
  return jakartaDate
}

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

  const currentPeriod = ref(PERIODS.TODAY)
  const customDateRange = ref([])
  const deliveryStats = ref({})
  const expenseStats = ref({})
  const vehicleStats = ref({})

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
    const today = getJakartaToday()

    switch (period) {
      case PERIODS.TODAY: {
        // For TODAY, use Jakarta's current date for both start and end
        return {
          start: today,
          end: today,
        }
      }
      case PERIODS.THIS_WEEK: {
        const start = new Date(today)
        // Get Monday (1) of current week in Jakarta timezone
        const day = start.getDay() || 7
        if (day !== 1) {
          start.setDate(start.getDate() - (day - 1))
        }
        return { start, end: today }
      }
      case PERIODS.THIS_MONTH: {
        const start = new Date(today.getFullYear(), today.getMonth(), 1)
        return { start, end: today }
      }
      case PERIODS.LAST_MONTH: {
        const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const end = new Date(today.getFullYear(), today.getMonth(), 0)
        return { start, end }
      }
      case PERIODS.L3M: {
        const start = new Date(today)
        start.setMonth(start.getMonth() - 3)
        start.setDate(1)
        return { start, end: today }
      }
      case PERIODS.YTD: {
        const start = new Date(today.getFullYear(), 0, 1)
        return { start, end: today }
      }
      case PERIODS.CUSTOM_RANGE: {
        if (customDateRange.value?.length === 2) {
          // Convert custom range dates to Jakarta timezone
          const [startDate, endDate] = customDateRange.value
          const start = getJakartaDate(new Date(startDate))
          const end = getJakartaDate(new Date(endDate))
          return { start, end }
        }
        return { start: today, end: today }
      }
      default: {
        return { start: today, end: today }
      }
    }
  }

  async function loadSectionData(section, params = {}) {
    if (loadingStates.value[section]) {
      console.log(`${section} data loading already in progress, skipping`)
      return
    }

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

      console.log(`Loading ${section} data for period:`, {
        period: currentPeriod.value,
        dateRange: fetchParams.dateRange,
        scope: currentScope.value,
        jakartaTime: getJakartaDate().toISOString(),
      })

      const currentResult = await dataProviderFactory.getData(
        section,
        currentScope.value,
        fetchParams,
      )

      let previousResult = null
      if (currentResult?.data?.length > 0) {
        previousResult = await loadPreviousPeriodData(section, dateRange, currentScope.value)
      }

      let stats
      switch (section) {
        case 'deliveries':
          stats = processDeliveryStats(currentResult)
          if (previousResult?.data) {
            const prevStats = processDeliveryStats(previousResult)
            calculateDeliveryTrends(stats, prevStats)
          }
          deliveryStats.value = stats
          break

        case 'expenses':
          stats = processExpenseStats(currentResult)
          if (previousResult?.data) {
            const prevStats = processExpenseStats(previousResult)
            calculateExpenseTrends(stats, prevStats)
          }
          expenseStats.value = stats
          break

        case 'vehicles':
          stats = processVehicleStats(currentResult)
          if (previousResult?.data) {
            const prevStats = processVehicleStats(previousResult)
            calculateVehicleTrends(stats, prevStats)
          }
          vehicleStats.value = stats
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
      console.log('Loading dashboard data for period:', {
        period: currentPeriod.value,
        jakartaTime: getJakartaDate().toISOString(),
      })
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

  onMounted(async () => {
    try {
      currentPeriod.value = PERIODS.TODAY
      if (currentScope.value) {
        await loadDashboardData()
      }
    } catch (error) {
      console.error('Error during initialization:', error)
    }
  })

  watch(
    () => ({
      type: currentScope.value?.type || 'global',
      value: currentScope.value?.value,
    }),
    (newScope, oldScope) => {
      if (newScope.type !== oldScope?.type || newScope.value !== oldScope?.value) {
        loadDashboardData()
      }
    },
    { deep: true },
  )

  watch(
    () => userStore.currentUser?.id,
    () => {
      console.log('User changed, reloading dashboard data')
      loadDashboardData()
    },
  )

  watch(currentPeriod, (newPeriod, oldPeriod) => {
    if (newPeriod !== oldPeriod) {
      const newRange = getDateRange(newPeriod)
      console.log('Period changed:', {
        from: oldPeriod,
        to: newPeriod,
        oldRange: oldPeriod ? getDateRange(oldPeriod) : null,
        newRange: {
          start: newRange.start.toISOString(),
          end: newRange.end.toISOString(),
        },
        jakartaTime: getJakartaDate().toISOString(),
      })
      loadDashboardData()
    }
  })

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
