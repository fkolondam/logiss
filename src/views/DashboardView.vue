<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">{{ t('dashboard.title') }}</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <RecentDeliveries :deliveries="recentDeliveries" :loading="loadingDeliveries" />
      <ExpensesOverview :expenses="recentExpenses" :loading="loadingExpenses" />
      <VehicleStatus :vehicles="vehicles" :loading="loadingVehicles" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useTranslations } from '../composables/useTranslations'
import { dataProviderFactory } from '../services/DataProviderFactory'
import RecentDeliveries from '../components/dashboard/RecentDeliveries.vue'
import ExpensesOverview from '../components/dashboard/ExpensesOverview.vue'
import VehicleStatus from '../components/dashboard/VehicleStatus.vue'

export default {
  name: 'DashboardView',
  components: {
    RecentDeliveries,
    ExpensesOverview,
    VehicleStatus
  },
  setup() {
    const { t } = useTranslations()
    const provider = dataProviderFactory.getProvider()

    // Data refs
    const recentDeliveries = ref([])
    const recentExpenses = ref([])
    const vehicles = ref([])

    // Loading states
    const loadingDeliveries = ref(true)
    const loadingExpenses = ref(true)
    const loadingVehicles = ref(true)

    const fetchDashboardData = async () => {
      try {
        // Fetch recent deliveries
        loadingDeliveries.value = true
        recentDeliveries.value = await provider.fetch('deliveries', {
          sort: 'date,desc',
          limit: 5
        })
      } catch (error) {
        console.error('Error fetching deliveries:', error)
      } finally {
        loadingDeliveries.value = false
      }

      try {
        // Fetch expenses data for different periods
        loadingExpenses.value = true
        const today = new Date()
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

        const [monthlyStats, weeklyStats, todayStats] = await Promise.all([
          provider.getExpenseStats({ dateRange: { start: oneMonthAgo, end: today } }),
          provider.getExpenseStats({ dateRange: { start: oneWeekAgo, end: today } }),
          provider.getExpenseStats({ dateRange: { start: today, end: today } })
        ])

        recentExpenses.value = {
          monthly: monthlyStats.total,
          weekly: weeklyStats.total,
          today: todayStats.total
        }
      } catch (error) {
        console.error('Error fetching expenses:', error)
      } finally {
        loadingExpenses.value = false
      }

      try {
        // Fetch vehicles
        loadingVehicles.value = true
        vehicles.value = await provider.fetch('vehicles')
      } catch (error) {
        console.error('Error fetching vehicles:', error)
      } finally {
        loadingVehicles.value = false
      }
    }

    onMounted(fetchDashboardData)

    return {
      t,
      recentDeliveries,
      recentExpenses,
      vehicles,
      loadingDeliveries,
      loadingExpenses,
      loadingVehicles
    }
  }
}
</script>
