import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { dataProviderFactory } from '../services/DataProviderFactory'
import { useUserStore } from '../stores/user'
import { PERIODS } from '../constants/periods'
import {
  processDeliveryStats,
  processExpenseStats,
  processVehicleStats,
} from './useStatsProcessing'
import { GoogleSheetsProvider } from '../services/providers/GoogleSheetsProvider'

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
  })

  const currentPeriod = ref(PERIODS.TODAY)
  const deliveryStats = ref({})
  const expenseStats = ref({})
  const vehicleStats = ref({})

  const canAccessDeliveries = computed(() => userStore.hasPermission('read_deliveries'))
  const canAccessExpenses = computed(() => userStore.hasPermission('read_expenses'))
  const canAccessVehicles = computed(() => userStore.hasPermission('read_vehicles'))

  // Fetch branches data and set it in the user store
  async function loadBranchesData() {
    const branchesData = await GoogleSheetsProvider.getBranchesData()
    userStore.setBranches(branchesData)
    userStore.setRegions([...new Set(branchesData.map((branch) => branch.region))]) // Set unique regions
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

      // Fetch current and previous period data for trend calculation
      const [currentResult, previousResult] = await Promise.all([
        dataProviderFactory.getData(section, currentScope.value, fetchParams),
        loadPreviousPeriodData(section, dateRange, currentScope.value),
      ])

      console.log(`Received ${section} current period data:`, currentResult)
      console.log(`Received ${section} previous period data:`, previousResult)

      // Process stats with trend calculations
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

      console.log(`Updated ${section} stats with trends:`, stats)
    } catch (e) {
      error.value = e.message
      console.error(`Error loading ${section} data:`, e)
    } finally {
      loadingStates.value[section] = false
      updateLoadingState()
    }
  }

  // Helper function to load previous period data
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

  // Helper function to get previous period date range
  function getPreviousDateRange({ start, end }) {
    const duration = end.getTime() - start.getTime()
    const previousStart = new Date(start.getTime() - duration)
    const previousEnd = new Date(end.getTime() - duration)
    return { start: previousStart, end: previousEnd }
  }

  // Calculate trends for different sections
  function calculateDeliveryTrends(currentStats, previousStats) {
    if (!previousStats) return

    // Calculate overall trend
    currentStats.trend = calculateTrendPercentage(currentStats.total, previousStats.total)

    // Calculate completion rate trend
    const currentCompletionRate = (currentStats.receivedAll / currentStats.total) * 100
    const previousCompletionRate = (previousStats.receivedAll / previousStats.total) * 100
    currentStats.completionTrend = Math.round(currentCompletionRate - previousCompletionRate)

    // Calculate status-specific trends
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

    // Calculate total amount trend
    currentStats.trend = calculateTrendPercentage(
      currentStats.totalAmount,
      previousStats.totalAmount,
    )

    // Calculate category-specific trends
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

    // Calculate status trends
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

  // Helper function to calculate trend percentage
  function calculateTrendPercentage(current, previous) {
    if (!previous) return 0
    return Math.round(((current - previous) / previous) * 100)
  }

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

  function updateLoadingState() {
    isLoading.value = Object.values(loadingStates.value).some(Boolean)
  }

  watch(
    () => ({
      type: currentScope.value?.type || 'global',
      value: currentScope.value?.value,
    }),
    (newScope, oldScope) => {
      if (newScope.type !== oldScope?.type || newScope.value !== oldScope?.value) {
        console.log(
          `Scope changed from ${oldScope?.type}:${oldScope?.value} to ${newScope.type}:${newScope.value}`,
        )
        loadDashboardData()
      }
    },
    { immediate: true, deep: true },
  )

  watch(currentPeriod, (newPeriod, oldPeriod) => {
    if (newPeriod !== oldPeriod) {
      console.log(`Period changed from ${oldPeriod} to ${newPeriod}`)
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
    PERIODS,
    loadDashboardData,
    loadSectionData,
    getDateRange,
  }
}
