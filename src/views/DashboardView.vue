<!-- Previous script section remains unchanged -->
<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { RefreshCw, AlertCircle } from 'lucide-vue-next'
import { useTranslations } from '../composables/useTranslations'
import { useDataSource } from '../stores/dataSource'
import { useDashboardCache } from '../composables/useDashboardCache'
import { useDashboardData } from '../composables/useDashboardData'
import { useDashboardState } from '../composables/useDashboardState'
import { useDashboardNotifications } from '../composables/useDashboardNotifications'

// Components
import RecentDeliveries from '../components/dashboard/RecentDeliveries.vue'
import ExpensesOverview from '../components/dashboard/ExpensesOverview.vue'
import VehicleStatus from '../components/dashboard/VehicleStatus.vue'
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton.vue'
import DashboardQuickActions from '../components/dashboard/DashboardQuickActions.vue'

const { t } = useTranslations()
const { getProvider } = useDataSource()
const { getCached, setCached, CACHE_KEYS, clearExpiredCache } = useDashboardCache()
const { getDateRange, getPreviousPeriodRange, PERIODS } = useDashboardData()
const { loadingStates, errors, withLoadingState, shouldRefresh, handleError } = useDashboardState()
const { checkVehicleNotifications, checkDeliveryNotifications } = useDashboardNotifications()

// Data refs with default values
const recentDeliveries = ref([])
const recentExpenses = ref({
  total: 0,
  count: 0,
  byCategory: {},
  previousTotal: 0,
  loading: false,
})
const vehicles = ref([])
const selectedPeriod = ref(PERIODS.TODAY)

// Intervals ref
const refreshInterval = ref(null)
const periodChangeTimeout = ref(null)

// Fetch deliveries directly from provider
const fetchDeliveries = async () => {
  try {
    console.log('Fetching deliveries...')
    const cachedData = getCached(CACHE_KEYS.RECENT_DELIVERIES)

    // Return cached data if valid
    if (cachedData && !shouldRefresh('deliveries')) {
      console.log('Using cached deliveries data')
      recentDeliveries.value = cachedData
      checkDeliveryNotifications(cachedData)
      return
    }

    // Get provider from store
    const provider = await getProvider()

    // Fetch fresh data
    const response = await provider.fetch('deliveries', {
      sort: 'date,desc',
      limit: 5,
    })

    // Validate response
    if (!response?.success) {
      throw new Error(t('errors.fetchFailed'))
    }

    // Validate data
    if (!Array.isArray(response.data)) {
      throw new Error(t('errors.invalidData'))
    }

    console.log('Received deliveries:', response.data.length)

    // Update data
    recentDeliveries.value = response.data
    setCached(CACHE_KEYS.RECENT_DELIVERIES, response.data)
    checkDeliveryNotifications(response.data)
  } catch (error) {
    console.error('Error fetching deliveries:', error)
    handleError('deliveries', {
      message: t('errors.fetchDeliveries'),
      details: error.message,
      code: 'FETCH_ERROR',
    })
    throw error
  }
}

const fetchExpenses = async (period = selectedPeriod.value) => {
  try {
    console.log('Fetching expenses...')
    const dateRange = getDateRange(period)
    if (!dateRange) {
      throw new Error(t('errors.invalidDateRange'))
    }

    // Get provider from store
    const provider = await getProvider()
    const response = await provider.getExpenseStats({ dateRange })

    // Validate response
    if (!response?.success) {
      throw new Error(t('errors.fetchFailed'))
    }

    // Validate data
    if (!response.data || typeof response.data !== 'object') {
      throw new Error(t('errors.invalidData'))
    }

    console.log('Received expenses data')

    recentExpenses.value = {
      ...response.data,
      loading: false,
      timestamp: response.timestamp,
    }
    setCached(CACHE_KEYS.EXPENSES_STATS, response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching expenses:', error)
    handleError('expenses', {
      message: t('errors.fetchExpenses'),
      details: error.message,
      code: 'FETCH_ERROR',
    })
    throw error
  }
}

const fetchVehicles = async () => {
  try {
    console.log('Fetching vehicles...')
    const cachedData = getCached(CACHE_KEYS.VEHICLES_STATUS)

    // Return cached data if valid
    if (cachedData && !shouldRefresh('vehicles')) {
      console.log('Using cached vehicles data')
      vehicles.value = cachedData
      checkVehicleNotifications(cachedData)
      return cachedData
    }

    // Get provider from store
    const provider = await getProvider()

    // Fetch fresh data
    const response = await provider.fetch('vehicles')

    // Validate response
    if (!response?.success) {
      throw new Error(t('errors.fetchFailed'))
    }

    // Validate data
    if (!Array.isArray(response.data)) {
      throw new Error(t('errors.invalidData'))
    }

    console.log('Received vehicles:', response.data.length)

    vehicles.value = response.data
    setCached(CACHE_KEYS.VEHICLES_STATUS, response.data)
    checkVehicleNotifications(response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    handleError('vehicles', {
      message: t('errors.fetchVehicles'),
      details: error.message,
      code: 'FETCH_ERROR',
    })
    throw error
  }
}

// Main dashboard data fetch with improved error handling
const fetchDashboardData = async () => {
  console.log('Fetching dashboard data...')
  clearExpiredCache() // Clean up expired cache entries

  await withLoadingState('dashboard', async () => {
    try {
      const results = await Promise.allSettled([
        withLoadingState('deliveries', fetchDeliveries),
        withLoadingState('expenses', () => fetchExpenses(selectedPeriod.value)),
        withLoadingState('vehicles', fetchVehicles),
      ])

      // Handle individual failures
      const failedSections = results.reduce((failed, result, index) => {
        if (result.status === 'rejected') {
          const sections = ['deliveries', 'expenses', 'vehicles']
          const section = sections[index]
          console.error(`Failed to fetch ${section}:`, result.reason)
          handleError(section, result.reason)
          failed.push(section)
        }
        return failed
      }, [])

      // If all sections failed, throw comprehensive error
      if (failedSections.length === 3) {
        throw new Error(t('errors.allSectionsFailed'))
      }

      // If some sections failed, show warning
      if (failedSections.length > 0) {
        handleError('dashboard', {
          message: t('errors.someSectionsFailed'),
          details: t('errors.failedSections', { sections: failedSections.join(', ') }),
          code: 'PARTIAL_FAILURE',
        })
      }

      console.log('Dashboard data fetched successfully')
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      handleError('dashboard', {
        message: error.message || t('errors.unexpectedError'),
        details: error.details,
        code: error.code || 'FETCH_ERROR',
      })
      throw error
    }
  })
}

// Watch period changes with debouncing
watch(selectedPeriod, async (newPeriod) => {
  if (periodChangeTimeout.value) {
    clearTimeout(periodChangeTimeout.value)
  }

  periodChangeTimeout.value = setTimeout(async () => {
    if (!loadingStates.value.dashboard) {
      try {
        await withLoadingState('expenses', () => fetchExpenses(newPeriod))
      } catch (error) {
        console.error('Error updating expenses for new period:', error)
        handleError('expenses', {
          message: t('errors.fetchExpenses'),
          details: error.message,
          code: 'UPDATE_ERROR',
        })
      }
    }
  }, 300)
})

// Initialize dashboard
onMounted(async () => {
  try {
    console.log('Initializing dashboard...')
    await fetchDashboardData()

    // Set up periodic refresh
    refreshInterval.value = setInterval(
      () => {
        if (shouldRefresh('dashboard') && !loadingStates.value.dashboard) {
          fetchDashboardData().catch((error) => {
            console.error('Error in periodic refresh:', error)
            handleError('dashboard', {
              message: t('errors.refreshError'),
              details: error.message,
              code: 'REFRESH_ERROR',
            })
          })
        }
      },
      5 * 60 * 1000,
    ) // Check every 5 minutes

    console.log('Dashboard initialized successfully')
  } catch (error) {
    console.error('Error in initial dashboard load:', error)
    handleError('dashboard', {
      message: t('errors.initError'),
      details: error.message,
      code: 'INIT_ERROR',
    })
  }
})

// Clean up on component unmount
onUnmounted(() => {
  if (refreshInterval.value) clearInterval(refreshInterval.value)
  if (periodChangeTimeout.value) clearTimeout(periodChangeTimeout.value)
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ t('dashboard.title') }}</h1>

      <div class="flex items-center gap-4">
        <!-- Quick Actions -->
        <DashboardQuickActions data-testid="quick-actions-button" />

        <!-- Refresh Button -->
        <button
          @click="fetchDashboardData"
          class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          :disabled="loadingStates.dashboard?.isLoading"
          data-testid="refresh-button"
        >
          <RefreshCw
            class="w-4 h-4"
            :class="{ 'animate-spin': loadingStates.dashboard?.isLoading }"
            data-testid="loading-spinner"
          />
          {{ t('dashboard.refresh') }}
          <span v-if="shouldRefresh('dashboard')" class="ml-1 text-xs text-blue-600">•</span>
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    <div
      v-if="errors.dashboard?.message || errors.dashboard?.details"
      class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
      data-testid="error-alert"
    >
      <div class="flex items-start gap-2 text-red-700">
        <AlertCircle class="w-5 h-5 mt-0.5 shrink-0" />
        <div class="flex-1 space-y-1">
          <p class="font-medium">
            {{ errors.dashboard?.message || t('errors.unexpectedError') }}
          </p>
          <p v-if="errors.dashboard?.details" class="text-sm text-red-600">
            {{ errors.dashboard.details }}
          </p>
          <p v-if="errors.dashboard?.code" class="text-xs text-red-500">
            {{ t('errors.code') }}: {{ errors.dashboard.code }}
          </p>
        </div>
      </div>
    </div>

    <!-- Dashboard Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="dashboard-grid">
      <!-- Loading States -->
      <template v-if="loadingStates.dashboard?.isLoading">
        <!-- Recent Deliveries Skeleton -->
        <div class="col-span-1">
          <DashboardSkeleton type="list" />
        </div>

        <!-- Expenses Overview Skeleton -->
        <div class="col-span-1">
          <DashboardSkeleton type="card" />
        </div>

        <!-- Vehicle Status Skeleton -->
        <div class="col-span-1">
          <DashboardSkeleton type="stats" />
        </div>
      </template>

      <!-- Content -->
      <template v-else>
        <!-- Recent Deliveries -->
        <div class="col-span-1" data-testid="recent-deliveries">
          <RecentDeliveries
            :deliveries="recentDeliveries"
            :loading="loadingStates.deliveries?.isLoading"
            :error="errors.deliveries?.message"
          />
        </div>

        <!-- Expenses Overview -->
        <div class="col-span-1" data-testid="expenses-overview">
          <ExpensesOverview
            v-model="selectedPeriod"
            :expenses="recentExpenses"
            :loading="loadingStates.expenses?.isLoading"
            :error="errors.expenses?.message"
          />
        </div>

        <!-- Vehicle Status -->
        <div class="col-span-1" data-testid="vehicle-status">
          <VehicleStatus
            :vehicles="vehicles"
            :loading="loadingStates.vehicles?.isLoading"
            :error="errors.vehicles?.message"
          />
        </div>
      </template>
    </div>
  </div>
</template>
