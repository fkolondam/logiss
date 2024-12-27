<template>
  <div v-if="canAccessDeliveries">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-heading font-bold text-gray-900">
          {{ shouldUsePersonalDashboard ? t('deliveries.personal.title') : t('deliveries.title') }}
        </h1>
        <!-- Vehicle indicator for operational users -->
        <div
          v-if="shouldUsePersonalDashboard && assignedVehicle"
          class="px-3 py-1 text-sm font-medium rounded-full bg-blue-50 text-blue-700 flex items-center gap-2"
        >
          <Truck class="w-4 h-4" />
          {{ assignedVehicle }}
        </div>
      </div>

      <!-- Period Selector (hidden for personal dashboard) -->
      <div v-if="!shouldUsePersonalDashboard" class="w-full sm:w-auto">
        <div
          class="grid grid-cols-3 w-full text-sm border border-gray-200 rounded-lg overflow-hidden bg-white"
        >
          <button
            v-for="period in periods"
            :key="period.value"
            @click="handlePeriodChange(period.value)"
            class="px-4 py-2 font-medium text-center transition-all duration-200 relative"
            :class="[
              currentPeriod === period.value
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-50',
            ]"
            :disabled="isLoading"
          >
            {{ period.label }}
            <div
              v-if="loadingStates[period.value]"
              class="absolute inset-0 bg-black/5 flex items-center justify-center"
            >
              <Loader2 class="w-4 h-4 animate-spin text-current" />
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
      <div class="flex items-center gap-2 text-red-700">
        <AlertCircle class="w-5 h-5" />
        <span class="font-medium">{{ error }}</span>
      </div>
    </div>

    <!-- Stats Section -->
    <DeliveryStats
      :stats="stats"
      :loading="loadingStates.stats"
      :is-personal="shouldUsePersonalDashboard"
    />

    <!-- Table with Search and Filters -->
    <div
      class="relative transition-all duration-300 ease-out-cubic"
      :class="{ 'mr-96': !isMobile && showSidebar }"
    >
      <DeliveriesTable
        :deliveries="deliveries"
        :loading="loadingStates.deliveries"
        :is-personal="shouldUsePersonalDashboard"
        @show-detail="viewDelivery"
      />
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
        <DeliveryDetail
          :delivery="selectedDelivery"
          :is-mobile="isMobile"
          :is-personal="shouldUsePersonalDashboard"
          @close="closeDetail"
        />
      </div>
    </Transition>
  </div>
  <!-- Access Denied -->
  <div v-else class="flex flex-col items-center justify-center p-8">
    <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
      <AlertCircle class="w-8 h-8 text-red-500" />
    </div>
    <h2 class="text-xl font-bold text-gray-900 mb-2">{{ t('common.accessDenied') }}</h2>
    <p class="text-gray-500 text-center mb-6">{{ t('deliveries.noAccess') }}</p>
    <router-link
      to="/"
      class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
    >
      <ArrowLeft class="w-4 h-4" />
      {{ t('common.backToDashboard') }}
    </router-link>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { useUserStore } from '../stores/user'
import { useTranslations } from '../composables/useTranslations'
import { useDeliveriesData } from '../composables/useDeliveriesData'
import { Loader2, AlertCircle, Truck, ArrowLeft } from 'lucide-vue-next'
import DeliveryStats from '../components/deliveries/DeliveryStats.vue'
import DeliveryDetail from '../components/deliveries/DeliveryDetail.vue'
import DeliveriesTable from '../components/deliveries/DeliveriesTable.vue'
import { PERIODS } from '../constants/periods'

const { t } = useTranslations()
const appStore = useAppStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const isMobile = inject('isMobile', ref(false))

// Get user-specific flags
const shouldUsePersonalDashboard = computed(() => userStore.shouldUsePersonalDashboard)
const assignedVehicle = computed(() => userStore.assignedVehicle)

// Use the deliveries data composable
const {
  isLoading,
  loadingStates,
  error,
  deliveries,
  stats,
  currentPeriod,
  refreshData,
  getDateRange,
  canAccessDeliveries,
} = useDeliveriesData()

const selectedDelivery = ref(null)

// Available periods for selection
const periods = computed(() => [
  { value: PERIODS.TODAY, label: t('common.periods.today') },
  { value: PERIODS.THIS_WEEK, label: t('common.periods.this_week') },
  { value: PERIODS.THIS_MONTH, label: t('common.periods.this_month') },
])

// Computed property to control sidebar visibility
const showSidebar = computed(() => {
  return route.name === 'deliveries' && appStore.rightSidebarOpen
})

// Handle period change
const handlePeriodChange = async (period) => {
  if (currentPeriod.value === period || isLoading.value) return

  try {
    currentPeriod.value = period
    await refreshData()
  } catch (e) {
    console.error('Error changing period:', e)
  }
}

const closeDetail = () => {
  selectedDelivery.value = null
  appStore.closeRightSidebar()
}

const viewDelivery = (delivery) => {
  selectedDelivery.value = delivery
  appStore.openRightSidebar(delivery.invoice)
}

// Watch for route changes
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

// Watch for mobile changes
watch(isMobile, (newValue) => {
  if (newValue && showSidebar.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Restore delivery from sidebar history
const restoreDeliveryFromHistory = () => {
  if (appStore.shouldRestoreSidebar('deliveries')) {
    const { deliveryId } = appStore.sidebarHistory['deliveries']
    const delivery = deliveries.value.find((d) => d.invoice === deliveryId)
    if (delivery) {
      selectedDelivery.value = delivery
      appStore.restoreSidebarState('deliveries')
    }
  }
}

onMounted(() => {
  appStore.setCurrentView('deliveries')
  if (canAccessDeliveries) {
    refreshData().then(() => {
      restoreDeliveryFromHistory()
    })
  }
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
</style>
