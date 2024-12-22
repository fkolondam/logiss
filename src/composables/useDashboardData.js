import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { dataProviderFactory } from '../services/DataProviderFactory'
import { useUserStore } from '../stores/user'

export function useDashboardData() {
  const userStore = useUserStore()
  const { scope: currentScope } = storeToRefs(userStore)

  // Reactive states
  const isLoading = ref(false)
  const error = ref(null)

  // Permission checks
  const canAccessDeliveries = computed(() => userStore.hasPermission('read_deliveries'))
  const canAccessExpenses = computed(() => userStore.hasPermission('read_expenses'))
  const canAccessVehicles = computed(() => userStore.hasPermission('read_vehicles'))

  // Stats
  const deliveryStats = ref(null)
  const expenseStats = ref(null)
  const vehicleStats = ref(null)

  // Lists
  const recentDeliveries = ref([])
  const recentExpenses = ref([])
  const vehicles = ref([])

  /**
   * Load all dashboard data
   */
  async function loadDashboardData() {
    console.log('Loading dashboard data for scope:', currentScope.value)
    isLoading.value = true
    error.value = null

    try {
      // Load stats based on permissions
      const statsPromises = []

      if (canAccessDeliveries.value) {
        statsPromises.push(dataProviderFactory.getStats('deliveries', currentScope.value))
      } else {
        statsPromises.push(Promise.resolve(null))
      }

      if (canAccessExpenses.value) {
        statsPromises.push(dataProviderFactory.getStats('expenses', currentScope.value))
      } else {
        statsPromises.push(Promise.resolve(null))
      }

      if (canAccessVehicles.value) {
        statsPromises.push(dataProviderFactory.getStats('vehicles', currentScope.value))
      } else {
        statsPromises.push(Promise.resolve(null))
      }

      const [deliveryData, expenseData, vehicleData] = await Promise.all(statsPromises)

      deliveryStats.value = deliveryData
      expenseStats.value = expenseData
      vehicleStats.value = vehicleData

      // Load recent items based on permissions
      const dataPromises = []

      if (canAccessDeliveries.value) {
        dataPromises.push(
          dataProviderFactory.getData('deliveries', currentScope.value, {
            sort: 'date,desc',
            limit: 5,
          }),
        )
      } else {
        dataPromises.push(Promise.resolve({ data: [] }))
      }

      if (canAccessExpenses.value) {
        dataPromises.push(
          dataProviderFactory.getData('expenses', currentScope.value, {
            sort: 'date,desc',
            limit: 5,
          }),
        )
      } else {
        dataPromises.push(Promise.resolve({ data: [] }))
      }

      if (canAccessVehicles.value) {
        dataPromises.push(dataProviderFactory.getData('vehicles', currentScope.value))
      } else {
        dataPromises.push(Promise.resolve({ data: [] }))
      }

      const [deliveries, expenses, vehicleList] = await Promise.all(dataPromises)

      recentDeliveries.value = deliveries.data
      recentExpenses.value = expenses.data
      vehicles.value = vehicleList.data
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
  async function refreshSection(section) {
    isLoading.value = true
    error.value = null

    try {
      switch (section) {
        case 'deliveries':
          deliveryStats.value = await dataProviderFactory.getStats('deliveries', currentScope.value)
          const deliveries = await dataProviderFactory.getData('deliveries', currentScope.value, {
            sort: 'date,desc',
            limit: 5,
          })
          recentDeliveries.value = deliveries.data
          break

        case 'expenses':
          expenseStats.value = await dataProviderFactory.getStats('expenses', currentScope.value)
          const expenses = await dataProviderFactory.getData('expenses', currentScope.value, {
            sort: 'date,desc',
            limit: 5,
          })
          recentExpenses.value = expenses.data
          break

        case 'vehicles':
          vehicleStats.value = await dataProviderFactory.getStats('vehicles', currentScope.value)
          const vehicleList = await dataProviderFactory.getData('vehicles', currentScope.value)
          vehicles.value = vehicleList.data
          break

        default:
          throw new Error(`Invalid section: ${section}`)
      }
    } catch (e) {
      error.value = e.message
      console.error(`Error refreshing ${section}:`, e)
    } finally {
      isLoading.value = false
    }
  }

  // Watch for scope changes and reload data
  watch(
    currentScope,
    (newScope) => {
      console.log('Scope changed to:', newScope)
      if (newScope) {
        loadDashboardData()
      }
    },
    { immediate: true },
  )

  return {
    // States
    isLoading,
    error,

    // Data
    deliveryStats,
    expenseStats,
    vehicleStats,
    recentDeliveries,
    recentExpenses,
    vehicles,

    // Methods
    loadDashboardData,
    refreshSection,
  }
}
