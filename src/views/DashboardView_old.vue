<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold">{{ t('dashboard.title') }}</h1>
        <!-- Scope indicator -->
        <div
          v-if="currentScope"
          class="px-3 py-1 text-sm font-medium rounded-full bg-blue-50 text-blue-700"
        >
          {{ getScopeLabel(currentScope) }}
        </div>
      </div>
      <button
        @click="refreshDashboard"
        class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        :disabled="isLoading"
      >
        <RefreshCw :class="{ 'animate-spin': isLoading }" class="w-4 h-4" />
        {{ t('dashboard.refresh') }}
      </button>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-center gap-2 text-red-700">
        <AlertCircle class="w-5 h-5" />
        <span class="font-medium">{{ error }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <RecentDeliveries
        :deliveries="recentDeliveries"
        :loading="isLoading"
        :error="componentErrors.deliveries"
      />
      <ExpensesOverview
        v-model="selectedPeriod"
        :expenses="recentExpenses"
        :loading="isLoading || recentExpenses?.loading"
        :error="componentErrors.expenses"
      />
      <VehicleStatus :vehicles="vehicles" :loading="isLoading" :error="componentErrors.vehicles" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RefreshCw, AlertCircle } from 'lucide-vue-next'
import { useTranslations } from '../composables/useTranslations'
import { useUserStore } from '../stores/user'
import { dataProviderFactory } from '../services/DataProviderFactory'
import RecentDeliveries from '../components/dashboard/RecentDeliveries.vue'
import ExpensesOverview from '../components/dashboard/ExpensesOverview.vue'
import VehicleStatus from '../components/dashboard/VehicleStatus.vue'

const { t } = useTranslations()
const userStore = useUserStore()
const provider = dataProviderFactory.getProvider()

// Data refs
const recentDeliveries = ref([])
const recentExpenses = ref([])
const vehicles = ref([])
const selectedPeriod = ref('today')

// UI state
const isLoading = ref(false)
const error = ref(null)
const componentErrors = ref({
  deliveries: null,
  expenses: null,
  vehicles: null,
})

// Get current user's scope
const currentScope = computed(() => userStore.scope)

// Helper function to get scope params
const getScopeParams = () => {
  if (!currentScope.value) return {}

  switch (currentScope.value.type) {
    case 'global':
      return {}
    case 'region':
      return { region: currentScope.value.value }
    case 'branch':
      return { branch: currentScope.value.value }
    case 'personal':
      return {
        filter: {
          driver: userStore.currentUser?.name,
        },
      }
    default:
      return {}
  }
}

// Helper function to get date range for period
const getDateRange = (period) => {
  const today = new Date()
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  return {
    start: period === 'month' ? oneMonthAgo : period === 'week' ? oneWeekAgo : today,
    end: today,
  }
}

// Get readable scope label
const getScopeLabel = (scope) => {
  if (!scope) return ''

  switch (scope.type) {
    case 'global':
      return t('scope.global')
    case 'region':
      return `${t('scope.region')}: ${scope.value}`
    case 'branch':
      return `${t('scope.branch')}: ${scope.value}`
    case 'personal':
      return `${t('scope.personal')}: ${scope.value}`
    default:
      return ''
  }
}

const fetchDashboardData = async () => {
  isLoading.value = true
  error.value = null
  componentErrors.value = {
    deliveries: null,
    expenses: null,
    vehicles: null,
  }

  try {
    // Get scope-based params
    const scopeParams = getScopeParams()

    // Fetch all data concurrently
    const [deliveriesData, expensesData, vehiclesData] = await Promise.all([
      // Deliveries
      provider
        .fetch('deliveries', {
          ...scopeParams,
          sort: 'date,desc',
          limit: 5,
        })
        .catch((err) => {
          componentErrors.value.deliveries = t('errors.fetchDeliveries')
          console.error('Error fetching deliveries:', err)
          return []
        }),

      // Get initial expenses data for selected period
      provider
        .getExpenseStats({
          ...scopeParams,
          dateRange: getDateRange(selectedPeriod.value),
        })
        .catch((err) => {
          componentErrors.value.expenses = t('errors.fetchExpenses')
          console.error('Error fetching expenses:', err)
          return { total: 0, count: 0, byCategory: {} }
        }),

      // Vehicles
      provider.fetch('vehicles', scopeParams).catch((err) => {
        componentErrors.value.vehicles = t('errors.fetchVehicles')
        console.error('Error fetching vehicles:', err)
        return []
      }),
    ])

    // Update refs with fetched data
    recentDeliveries.value = deliveriesData
    recentExpenses.value = {
      ...(expensesData || { total: 0, count: 0, byCategory: {} }),
      loading: false,
    }
    vehicles.value = vehiclesData

    // Set general error if all components failed
    if (Object.values(componentErrors.value).every((err) => err !== null)) {
      error.value = t('errors.fetchDashboard')
    }
  } catch (err) {
    error.value = t('errors.fetchDashboard')
    console.error('Error fetching dashboard data:', err)
  } finally {
    isLoading.value = false
  }
}

const refreshDashboard = () => {
  fetchDashboardData()
}

// Watch for period changes and update only expenses data
watch(selectedPeriod, async (newPeriod) => {
  if (!isLoading.value) {
    // Only handle period changes when not doing full refresh
    componentErrors.value.expenses = null
    recentExpenses.value = {
      ...recentExpenses.value,
      loading: true,
    }

    try {
      const scopeParams = getScopeParams()
      const expensesData = await provider.getExpenseStats({
        ...scopeParams,
        dateRange: getDateRange(newPeriod),
      })
      recentExpenses.value = {
        ...expensesData,
        loading: false,
      }
    } catch (err) {
      componentErrors.value.expenses = t('errors.fetchExpenses')
      console.error('Error fetching expenses:', err)
      recentExpenses.value = {
        ...recentExpenses.value,
        loading: false,
      }
    }
  }
})

// Watch for scope changes and refresh data
watch(
  () => currentScope.value,
  () => {
    fetchDashboardData()
  },
)

onMounted(fetchDashboardData)
</script>
