import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { dataProviderFactory } from '../services/DataProviderFactory'
import { useUserStore } from '../stores/user'
import { PERIODS } from '../constants/periods'

export function useDeliveriesData() {
  const userStore = useUserStore()
  const {
    scope: currentScope,
    roleConfig,
    shouldUsePersonalDashboard,
    assignedVehicle,
    canAccessView,
  } = storeToRefs(userStore)

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

  // Check if user can access deliveries view
  const canAccessDeliveries = computed(() => {
    const access = canAccessView.value('deliveries')
    return access !== 'none' && access !== false
  })

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
    if (!canAccessDeliveries.value) {
      error.value = 'Access denied'
      return
    }

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

      // Add role-specific parameters
      if (shouldUsePersonalDashboard.value) {
        fetchParams.assignedVehicle = assignedVehicle.value
        fetchParams.personalView = true
      }

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

      deliveries.value = result.data
    } catch (e) {
      error.value = e.message
      console.error('Error fetching deliveries:', e)
    } finally {
      loadingStates.value.deliveries = false
      updateLoadingState()
    }
  }

  async function fetchStats(params = {}) {
    if (!canAccessDeliveries.value) {
      error.value = 'Access denied'
      return
    }

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

      // Add role-specific parameters
      if (shouldUsePersonalDashboard.value) {
        fetchParams.assignedVehicle = assignedVehicle.value
        fetchParams.personalStats = true
        fetchParams.focusOnVehicle = true
      }

      console.log('Fetching stats for period:', currentPeriod.value, 'with params:', fetchParams)
      const data = await dataProviderFactory.getStats('deliveries', currentScope.value, {
        ...fetchParams,
        includeTrends: true,
      })

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
    if (isLoading.value || !canAccessDeliveries.value) return

    const dateRange = getDateRange(currentPeriod.value)
    loadingStates.value[currentPeriod.value] = true

    try {
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
    canAccessDeliveries,

    // Methods
    fetchDeliveries,
    fetchStats,
    refreshData,
    getDateRange,
  }
}
