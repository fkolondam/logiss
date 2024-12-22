import { ref, computed } from 'vue'
import { DataProviderFactory } from '../services/DataProviderFactory'
import { useUserStore } from '../stores/user'

export function useDashboardData() {
  const userStore = useUserStore()
  const dataProvider = new DataProviderFactory()

  // Reactive states
  const isLoading = ref(false)
  const error = ref(null)

  // Stats
  const deliveryStats = ref(null)
  const expenseStats = ref(null)
  const vehicleStats = ref(null)

  // Lists
  const recentDeliveries = ref([])
  const recentExpenses = ref([])
  const vehicles = ref([])

  // Get current scope from user store
  const currentScope = computed(() => userStore.scope)

  /**
   * Load all dashboard data
   */
  async function loadDashboardData() {
    isLoading.value = true
    error.value = null

    try {
      // Load stats
      const [deliveryData, expenseData, vehicleData] = await Promise.all([
        dataProvider.getStats('deliveries', currentScope.value),
        dataProvider.getStats('expenses', currentScope.value),
        dataProvider.getStats('vehicles', currentScope.value),
      ])

      deliveryStats.value = deliveryData
      expenseStats.value = expenseData
      vehicleStats.value = vehicleData

      // Load recent items
      const [deliveries, expenses, vehicleList] = await Promise.all([
        dataProvider.getData('deliveries', currentScope.value, {
          sort: 'date,desc',
          limit: 5,
        }),
        dataProvider.getData('expenses', currentScope.value, {
          sort: 'date,desc',
          limit: 5,
        }),
        dataProvider.getData('vehicles', currentScope.value),
      ])

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
          deliveryStats.value = await dataProvider.getStats('deliveries', currentScope.value)
          const deliveries = await dataProvider.getData('deliveries', currentScope.value, {
            sort: 'date,desc',
            limit: 5,
          })
          recentDeliveries.value = deliveries.data
          break

        case 'expenses':
          expenseStats.value = await dataProvider.getStats('expenses', currentScope.value)
          const expenses = await dataProvider.getData('expenses', currentScope.value, {
            sort: 'date,desc',
            limit: 5,
          })
          recentExpenses.value = expenses.data
          break

        case 'vehicles':
          vehicleStats.value = await dataProvider.getStats('vehicles', currentScope.value)
          const vehicleList = await dataProvider.getData('vehicles', currentScope.value)
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
