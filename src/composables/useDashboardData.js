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
      }

      console.log(`Loading ${section} data with params:`, fetchParams)
      const result = await dataProviderFactory.getData(section, currentScope.value, fetchParams)
      console.log(`Received ${section} data:`, result)

      switch (section) {
        case 'deliveries':
          deliveryStats.value = processDeliveryStats(result)
          break
        case 'expenses':
          expenseStats.value = processExpenseStats(result)
          break
        case 'vehicles':
          vehicleStats.value = processVehicleStats(result)
          break
      }

      console.log(
        `Updated ${section} stats:`,
        {
          deliveries: deliveryStats.value,
          expenses: expenseStats.value,
          vehicles: vehicleStats.value,
        }[section],
      )
    } catch (e) {
      error.value = e.message
      console.error(`Error loading ${section} data:`, e)
    } finally {
      loadingStates.value[section] = false
      updateLoadingState()
    }
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
