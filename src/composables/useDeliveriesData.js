import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../stores/user'
import { dataProviderFactory } from '../services/DataProviderFactory'
import { PERIODS, getDateRangeForPeriod, formatDateRange } from '../constants/periods'

export function useDeliveriesData() {
  const userStore = useUserStore()
  const { scope: currentScope } = storeToRefs(userStore)

  const isLoading = ref(false)
  const error = ref(null)
  const loadingStates = ref({
    [PERIODS.TODAY]: false,
    [PERIODS.THIS_WEEK]: false,
    [PERIODS.THIS_MONTH]: false,
    [PERIODS.LAST_MONTH]: false,
    [PERIODS.L3M]: false,
    [PERIODS.YTD]: false,
    [PERIODS.CUSTOM_RANGE]: false,
  })

  const currentPeriod = ref(PERIODS.TODAY)
  const deliveriesData = ref([])

  const canAccessDeliveries = computed(() => userStore.hasPermission('read_deliveries'))

  async function loadDeliveries(params = {}) {
    if (!canAccessDeliveries.value) {
      console.warn('User does not have permission to access deliveries')
      return
    }

    try {
      const dateRange = params.dateRange || getDateRangeForPeriod(currentPeriod.value)
      const fetchParams = {
        ...params,
        dateRange: formatDateRange(dateRange),
        scope: currentScope.value,
      }

      const result = await dataProviderFactory.getData(
        'deliveries',
        currentScope.value,
        fetchParams,
      )
      deliveriesData.value = result.data || []
      return result
    } catch (e) {
      error.value = e.message
      console.error('Error loading deliveries:', e)
      return null
    }
  }

  async function loadDeliveriesForPeriod(period = PERIODS.TODAY, params = {}) {
    if (loadingStates.value[period]) {
      console.log(`Deliveries for ${period} already loading, skipping`)
      return
    }

    loadingStates.value[period] = true
    error.value = null

    try {
      const dateRange = getDateRangeForPeriod(period)
      const fetchParams = {
        ...params,
        dateRange: formatDateRange(dateRange),
        scope: currentScope.value,
      }

      const result = await dataProviderFactory.getData(
        'deliveries',
        currentScope.value,
        fetchParams,
      )
      deliveriesData.value = result.data || []
      return result
    } catch (e) {
      error.value = e.message
      console.error(`Error loading deliveries for ${period}:`, e)
      return null
    } finally {
      loadingStates.value[period] = false
    }
  }

  async function refreshData() {
    const dateRange = getDateRangeForPeriod(currentPeriod.value)
    loadingStates.value[currentPeriod.value] = true

    try {
      await loadDeliveries({ dateRange: formatDateRange(dateRange) })
    } finally {
      loadingStates.value[currentPeriod.value] = false
    }
  }

  return {
    isLoading,
    loadingStates,
    error,
    deliveriesData,
    currentPeriod,
    loadDeliveries,
    loadDeliveriesForPeriod,
    refreshData,
    PERIODS,
  }
}
