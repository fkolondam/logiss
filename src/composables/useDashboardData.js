import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { dataProviderFactory } from '../services/DataProviderFactory'
import { useUserStore } from '../stores/user'
import {
  PERIODS,
  getDateRangeForPeriod,
  formatDateRange,
  getPreviousPeriodRange,
} from '../constants/periods'
import { getJakartaDate } from '../config/dateFormat'
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

  async function loadSectionData(section, params = {}) {
    if (loadingStates.value[section]) {
      console.log(`${section} data loading already in progress, skipping`)
      return
    }

    loadingStates.value[section] = true
    error.value = null

    try {
      console.log('Loading section data:', {
        section,
        period: currentPeriod.value,
        params,
      })

      const dateRange = getDateRangeForPeriod(currentPeriod.value, customDateRange.value)
      const formattedDateRange = formatDateRange(dateRange)

      console.log('Calculated date range:', {
        section,
        period: currentPeriod.value,
        dateRange: formattedDateRange,
      })

      const fetchParams = {
        ...params,
        dateRange: formattedDateRange,
        period: currentPeriod.value,
        scope: currentScope.value,
      }

      const currentResult = await dataProviderFactory.getData(
        section,
        currentScope.value,
        fetchParams,
      )

      let previousResult = null
      if (currentResult?.data?.length > 0) {
        const previousDateRange = getPreviousPeriodRange(dateRange)
        previousResult = await dataProviderFactory.getData(section, currentScope.value, {
          dateRange: formatDateRange(previousDateRange),
        })
      }

      let stats
      switch (section) {
        case 'deliveries':
          stats = processDeliveryStats(currentResult)
          if (previousResult?.data) {
            const prevStats = processDeliveryStats(previousResult)
            calculateDeliveryTrends(stats, prevStats)
          }
          stats.period = currentPeriod.value
          deliveryStats.value = stats
          break

        case 'expenses':
          stats = processExpenseStats(currentResult)
          if (previousResult?.data) {
            const prevStats = processExpenseStats(previousResult)
            calculateExpenseTrends(stats, prevStats)
          }
          stats.period = currentPeriod.value
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

  function updateLoadingState() {
    isLoading.value = Object.values(loadingStates.value).some(Boolean)
  }

  async function loadDashboardData() {
    if (isLoading.value) {
      console.log('Already loading dashboard data, skipping')
      return
    }

    isLoading.value = true
    error.value = null

    try {
      console.log('Loading dashboard data:', {
        period: currentPeriod.value,
        jakartaDate: getJakartaDate().toISOString().split('T')[0],
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
      console.log('Period changed:', {
        from: oldPeriod,
        to: newPeriod,
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
    updateDateRange,
  }
}
