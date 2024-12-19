<script setup>
import { ref, onMounted, watch } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import { useTranslations } from '../composables/useTranslations'
import { dataProviderFactory } from '../services/DataProviderFactory'
import { useDashboardCache } from '../composables/useDashboardCache'
import { useDashboardData } from '../composables/useDashboardData'
import { useDashboardState } from '../composables/useDashboardState'
import { useDashboardNotifications } from '../composables/useDashboardNotifications'

// Components
import RecentDeliveries from '../components/dashboard/RecentDeliveries.vue'
import ExpensesOverview from '../components/dashboard/ExpensesOverview.vue'
import VehicleStatus from '../components/dashboard/VehicleStatus.vue'
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton.vue'
import DashboardNotifications from '../components/dashboard/DashboardNotifications.vue'
import DashboardQuickActions from '../components/dashboard/DashboardQuickActions.vue'

const { t } = useTranslations()
const provider = dataProviderFactory.getProvider()
const { getCached, setCached, CACHE_KEYS } = useDashboardCache()
const { getDateRange, filterByPeriod } = useDashboardData()
const { loadingStates, errors, withLoadingState } = useDashboardState()
const { checkVehicleNotifications, checkDeliveryNotifications } = useDashboardNotifications()

// Data refs
const recentDeliveries = ref([])
const recentExpenses = ref([])
const vehicles = ref([])
const selectedPeriod = ref('today')

// Fetch dashboard data with caching
const fetchDashboardData = async () => {
  await withLoadingState('dashboard', async () => {
    try {
      // Try to get data from cache first
      const cachedDeliveries = getCached(CACHE_KEYS.RECENT_DELIVERIES)
      const cachedExpenses = getCached(CACHE_KEYS.EXPENSES_STATS)
      const cachedVehicles = getCached(CACHE_KEYS.VEHICLES_STATUS)

      // Fetch only what's not in cache
      const [
        deliveriesData = cachedDeliveries,
        expensesData = cachedExpenses,
        vehiclesData = cachedVehicles
      ] = await Promise.all([
        !cachedDeliveries && provider.fetch('deliveries', {
          sort: 'date,desc',
          limit: 5
        }),
        !cachedExpenses && provider.getExpenseStats({ 
          dateRange: getDateRange(selectedPeriod.value)
        }),
        !cachedVehicles && provider.fetch('vehicles')
      ])

      // Update data and cache
      if (deliveriesData) {
        recentDeliveries.value = deliveriesData
        setCached(CACHE_KEYS.RECENT_DELIVERIES, deliveriesData)
        checkDeliveryNotifications(deliveriesData)
      }

      if (expensesData) {
        recentExpenses.value = { 
          ...(expensesData || { total: 0, count: 0, byCategory: {} }),
          loading: false
        }
        setCached(CACHE_KEYS.EXPENSES_STATS, expensesData)
      }

      if (vehiclesData) {
        vehicles.value = vehiclesData
        setCached(CACHE_KEYS.VEHICLES_STATUS, vehiclesData)
        checkVehicleNotifications(vehiclesData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    }
  })
}

// Watch for period changes and update expenses data
watch(selectedPeriod, async (newPeriod) => {
  if (!loadingStates.value.dashboard) {
    await withLoadingState('expenses', async () => {
      try {
        const expensesData = await provider.getExpenseStats({ 
          dateRange: getDateRange(newPeriod)
        })
        recentExpenses.value = { 
          ...expensesData,
          loading: false
        }
        setCached(CACHE_KEYS.EXPENSES_STATS, expensesData)
      } catch (error) {
        console.error('Error fetching expenses:', error)
        throw error
      }
    })
  }
})

// Initial data fetch
onMounted(fetchDashboardData)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ t('dashboard.title') }}</h1>
      
      <div class="flex items-center gap-4">
        <!-- Notifications -->
        <DashboardNotifications />

        <!-- Quick Actions -->
        <DashboardQuickActions />

        <!-- Refresh Button -->
        <button 
          @click="fetchDashboardData" 
          class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          :disabled="loadingStates.dashboard"
        >
          <RefreshCw 
            :class="{'animate-spin': loadingStates.dashboard}" 
            class="w-4 h-4" 
          />
          {{ t('dashboard.refresh') }}
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    <div 
      v-if="errors.dashboard" 
      class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
    >
      <div class="flex items-center gap-2 text-red-700">
        <AlertCircle class="w-5 h-5" />
        <span class="font-medium">{{ errors.dashboard }}</span>
      </div>
    </div>

    <!-- Dashboard Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Recent Deliveries -->
      <template v-if="loadingStates.dashboard">
        <DashboardSkeleton type="list" :rows="5" />
      </template>
      <template v-else>
        <RecentDeliveries 
          :deliveries="recentDeliveries" 
          :loading="loadingStates.deliveries" 
          :error="errors.deliveries" 
        />
      </template>

      <!-- Expenses Overview -->
      <template v-if="loadingStates.dashboard">
        <DashboardSkeleton type="card" :rows="4" />
      </template>
      <template v-else>
        <ExpensesOverview 
          v-model="selectedPeriod"
          :expenses="recentExpenses" 
          :loading="loadingStates.expenses" 
          :error="errors.expenses"
        />
      </template>

      <!-- Vehicle Status -->
      <template v-if="loadingStates.dashboard">
        <DashboardSkeleton type="stats" :rows="4" />
      </template>
      <template v-else>
        <VehicleStatus 
          :vehicles="vehicles" 
          :loading="loadingStates.vehicles" 
          :error="errors.vehicles" 
        />
      </template>
    </div>
  </div>
</template>
