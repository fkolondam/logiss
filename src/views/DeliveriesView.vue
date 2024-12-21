<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-heading font-bold text-gray-900">{{ t('deliveries.title') }}</h1>

      <!-- Period Selector -->
      <div class="flex items-center gap-4">
        <select
          v-model="selectedPeriod"
          class="pl-3 pr-8 py-2 text-sm font-medium text-gray-900 rounded-lg border border-gray-200 bg-white outline-none focus:border-primary-300 focus:ring-4 ring-primary-100/50"
        >
          <option :value="PERIODS.TODAY">{{ t('common.today') }}</option>
          <option :value="PERIODS.THIS_WEEK">{{ t('deliveries.stats.thisWeek') }}</option>
          <option :value="PERIODS.THIS_MONTH">{{ t('deliveries.stats.thisMonth') }}</option>
        </select>

        <button
          @click="refreshData"
          class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          :disabled="loading || loadingStats"
        >
          <RefreshCw :class="{ 'animate-spin': loading || loadingStats }" class="w-4 h-4" />
          {{ t('common.refresh') }}
        </button>
      </div>
    </div>

    <!-- Stats Section -->
    <DeliveryStats :stats="currentStats" :loading="loadingStats" :error="statsError" />

    <!-- Table with Search and Filters -->
    <div
      class="relative transition-all duration-300 ease-out-cubic"
      :class="{ 'mr-96': !isMobile && showSidebar }"
    >
      <!-- Loading State -->
      <div
        v-if="loading"
        class="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center"
      >
        <div class="flex flex-col items-center gap-3">
          <Loader2 class="w-8 h-8 text-primary-500 animate-spin" />
          <span class="text-sm text-gray-600">{{ t('deliveries.loading') }}</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-4 bg-red-50 rounded-lg">
        <div class="flex items-center gap-2 text-red-600">
          <AlertCircle class="w-5 h-5" />
          <span>{{ error }}</span>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="overflow-x-auto" :class="{ 'scroll-smooth': !isMobile && showSidebar }">
        <div class="hidden md:block">
          <DeliveriesTable :deliveries="tableData" @show-detail="viewDelivery" />
        </div>
        <div class="md:hidden">
          <DeliveriesList :deliveries="tableData" @show-detail="viewDelivery" />
        </div>
      </div>
    </div>

    <!-- Detail Sidebar -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out-cubic"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-300 ease-out-cubic"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div v-if="selectedDelivery && showSidebar" class="fixed inset-y-0 right-0 w-96">
        <DeliveryDetail :delivery="selectedDelivery" :is-mobile="isMobile" @close="closeDetail" />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { useTranslations } from '../composables/useTranslations'
import { useDataSource } from '../stores/dataSource'
import { useDashboardData } from '../composables/useDashboardData'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-vue-next'
import DeliveryStats from '../components/deliveries/DeliveryStats.vue'
import DeliveryDetail from '../components/deliveries/DeliveryDetail.vue'
import DeliveriesTable from '../components/deliveries/DeliveriesTable.vue'
import DeliveriesList from '../components/deliveries/DeliveriesList.vue'

const { t } = useTranslations()
const appStore = useAppStore()
const route = useRoute()
const router = useRouter()
const { getProvider } = useDataSource()
const isMobile = inject('isMobile', ref(false))
const { PERIODS, getDateRange } = useDashboardData()

// State
const deliveries = ref([])
const currentStats = ref({
  total: 0,
  completed: 0,
  partial: 0,
  pending: 0,
  cancelled: 0,
  successRate: 0,
  previousTotal: 0,
  previousCompleted: 0,
  previousPending: 0,
  previousSuccessRate: 0,
  displayRange: '',
  previousDisplayRange: '',
})
const loading = ref(true)
const loadingStats = ref(true)
const selectedDelivery = ref(null)
const statsError = ref(null)
const error = ref(null)
const selectedPeriod = ref(PERIODS.THIS_MONTH)

// Computed properties
const showSidebar = computed(() => {
  return route.name === 'deliveries' && appStore.rightSidebarOpen
})

const tableData = computed(() => {
  return Array.isArray(deliveries.value) ? deliveries.value : []
})

// Fetch data
const fetchDeliveries = async () => {
  loading.value = true
  error.value = null
  try {
    const provider = await getProvider()
    const dateRange = getDateRange(selectedPeriod.value)
    if (!dateRange) {
      throw new Error(t('errors.invalidDateRange'))
    }

    console.log('Fetching deliveries with date range:', dateRange)

    const params = {
      sort: 'date,desc',
      filters: { dateRange },
    }
    const response = await provider.fetch('deliveries', params)

    // Validate response
    if (!response?.success) {
      throw new Error(t('errors.fetchFailed'))
    }

    // Validate data
    if (!Array.isArray(response.data)) {
      throw new Error(t('errors.invalidData'))
    }

    console.log('Received deliveries:', response.data.length)

    // Update state
    deliveries.value = response.data

    // Restore selected delivery if exists in sidebar history
    if (appStore.shouldRestoreSidebar('deliveries')) {
      const { deliveryId } = appStore.sidebarHistory['deliveries']
      const delivery = deliveries.value.find((d) => d.invoice === deliveryId)
      if (delivery) {
        selectedDelivery.value = delivery
        appStore.restoreSidebarState('deliveries')
      }
    }
  } catch (err) {
    console.error('Error fetching deliveries:', err)
    error.value = err.message || t('errors.fetchFailed')
    deliveries.value = []
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  loadingStats.value = true
  statsError.value = null
  try {
    const provider = await getProvider()
    const dateRange = getDateRange(selectedPeriod.value)
    if (!dateRange) {
      throw new Error(t('errors.invalidDateRange'))
    }

    console.log('Fetching stats with date range:', dateRange)

    const response = await provider.getDeliveryStats({ dateRange })

    // Validate response
    if (!response?.success) {
      throw new Error(t('errors.fetchStatsFailed'))
    }

    // Validate data
    if (!response.data || typeof response.data !== 'object') {
      throw new Error(t('errors.invalidStatsData'))
    }

    console.log('Received stats:', response.data)

    // Update state with proper defaults
    currentStats.value = {
      total: response.data.total ?? 0,
      completed: response.data.completed ?? 0,
      partial: response.data.partial ?? 0,
      pending: response.data.pending ?? 0,
      cancelled: response.data.cancelled ?? 0,
      successRate: response.data.successRate ?? 0,
      previousTotal: response.data.previousTotal ?? 0,
      previousCompleted: response.data.previousCompleted ?? 0,
      previousPending: response.data.previousPending ?? 0,
      previousSuccessRate: response.data.previousSuccessRate ?? 0,
      displayRange: response.data.displayRange ?? '',
      previousDisplayRange: response.data.previousDisplayRange ?? '',
    }
  } catch (err) {
    console.error('Error fetching stats:', err)
    statsError.value = err.message || t('errors.fetchStatsFailed')
    currentStats.value = {
      total: 0,
      completed: 0,
      partial: 0,
      pending: 0,
      cancelled: 0,
      successRate: 0,
      previousTotal: 0,
      previousCompleted: 0,
      previousPending: 0,
      previousSuccessRate: 0,
      displayRange: '',
      previousDisplayRange: '',
    }
  } finally {
    loadingStats.value = false
  }
}

const refreshData = () => {
  fetchDeliveries()
  fetchStats()
}

// Event handlers
const closeDetail = () => {
  selectedDelivery.value = null
  appStore.closeRightSidebar()
}

const viewDelivery = (delivery) => {
  selectedDelivery.value = delivery
  appStore.openRightSidebar(delivery.invoice)
}

// Watchers
watch(selectedPeriod, () => {
  refreshData()
})

watch(
  () => route.name,
  (newRoute, oldRoute) => {
    if (newRoute !== 'deliveries') {
      // Save state before navigating away if sidebar is open
      if (selectedDelivery.value) {
        appStore.saveSidebarState()
      }
      // Reset local state but don't close sidebar yet
      selectedDelivery.value = null
    } else if (oldRoute !== 'deliveries') {
      // Coming back to deliveries view
      if (appStore.shouldRestoreSidebar('deliveries')) {
        const deliveryId = appStore.sidebarHistory['deliveries'].deliveryId
        const delivery = deliveries.value.find((d) => d.invoice === deliveryId)
        if (delivery) {
          selectedDelivery.value = delivery
        }
      }
    }
  },
  { immediate: true },
)

watch(isMobile, (newValue) => {
  if (newValue && showSidebar.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Lifecycle hooks
onMounted(() => {
  appStore.setCurrentView('deliveries')
  refreshData()
})

onBeforeUnmount(() => {
  // Clean up
  document.body.style.overflow = ''

  // Save state if sidebar is open
  if (selectedDelivery.value) {
    appStore.saveSidebarState()
  }
})
</script>

<style scoped>
.ease-out-cubic {
  transition-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
