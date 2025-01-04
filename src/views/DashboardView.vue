<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold">{{ t('dashboard.title') }}</h1>
        <!-- Scope indicator -->
        <div
          v-if="currentScope"
          class="px-3 py-1 text-sm font-medium rounded-full bg-blue-50 text-blue-700 flex items-center gap-2"
        >
          <component :is="getScopeIcon" class="w-4 h-4" />
          {{ getScopeLabel(currentScope) }}
        </div>
      </div>

      <!-- Timeline Selector -->
      <TimelineSelector
        v-model="currentPeriod"
        v-model:custom-range="customDateRange"
        @update:model-value="handlePeriodChange"
      />
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
      <div class="flex items-center gap-2 text-red-700">
        <AlertCircle class="w-5 h-5" />
        <span class="font-medium">{{ error }}</span>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="!hasLoadedInitialData" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="i in 3"
        :key="i"
        class="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-pulse"
      >
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div class="space-y-3">
          <div class="h-3 bg-gray-200 rounded"></div>
          <div class="h-3 bg-gray-200 rounded w-5/6"></div>
          <div class="h-3 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <template v-if="userStore.hasPermission('read_deliveries')">
          <Suspense>
            <template #default>
              <RecentDeliveries
                :key="`deliveries-${currentPeriod}-${scopeKey}`"
                :stats="deliveryStats"
                :loading="loadingStates.deliveries"
                :scope="currentScope"
              />
            </template>
            <template #fallback>
              <DashboardSkeleton />
            </template>
          </Suspense>
        </template>

        <template v-if="userStore.hasPermission('read_expenses')">
          <Suspense>
            <template #default>
              <ExpensesOverview
                :key="`expenses-${currentPeriod}-${scopeKey}`"
                :stats="expenseStats"
                :loading="loadingStates.expenses"
                :scope="currentScope"
              />
            </template>
            <template #fallback>
              <DashboardSkeleton />
            </template>
          </Suspense>
        </template>

        <template v-if="userStore.hasPermission('read_vehicles')">
          <Suspense>
            <template #default>
              <VehicleStatus
                :key="`vehicles-${scopeKey}`"
                :stats="vehicleStats"
                :loading="loadingStates.vehicles"
                :scope="currentScope"
              />
            </template>
            <template #fallback>
              <DashboardSkeleton />
            </template>
          </Suspense>
        </template>

        <!-- Show message if no permissions -->
        <div
          v-if="!hasAnyPermissions"
          class="col-span-full flex items-center justify-center p-8 bg-gray-50 rounded-lg animate-fadeIn"
        >
          <div class="text-center">
            <AlertCircle class="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p class="text-gray-600">{{ t('dashboard.noAccess') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { AlertCircle, Globe, Map, Building2 } from 'lucide-vue-next'
import { useTranslations } from '../composables/useTranslations'
import { useUserStore } from '../stores/user'
import { useDashboardData } from '../composables/useDashboardData'
import RecentDeliveries from '../components/dashboard/RecentDeliveries.vue'
import ExpensesOverview from '../components/dashboard/ExpensesOverview.vue'
import VehicleStatus from '../components/dashboard/VehicleStatus.vue'
import { PERIODS } from '../constants/periods'
import TimelineSelector from '../components/layout/TimelineSelector.vue'

// Skeleton component for loading state
const DashboardSkeleton = {
  template: `
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-pulse">
      <div class="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div class="space-y-3">
        <div class="h-3 bg-gray-200 rounded"></div>
        <div class="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  `,
}

const { t } = useTranslations()
const userStore = useUserStore()
const hasLoadedInitialData = ref(false)

// Get dashboard data using the composable
const {
  isLoading,
  loadingStates,
  error,
  deliveryStats,
  expenseStats,
  vehicleStats,
  loadDashboardData,
  refreshSection,
  currentPeriod,
  customDateRange,
} = useDashboardData()

// Check if user has any dashboard permissions
const hasAnyPermissions = computed(() => {
  return (
    userStore.hasPermission('read_deliveries') ||
    userStore.hasPermission('read_expenses') ||
    userStore.hasPermission('read_vehicles')
  )
})

// Get current user's scope
const currentScope = computed(() => userStore.scope)

// Generate a unique key for scope changes
const scopeKey = computed(() => {
  const scope = currentScope.value
  return scope ? `${scope.type}-${scope.value || 'all'}` : 'global'
})

// Get scope icon
const getScopeIcon = computed(() => {
  if (!currentScope.value) return Globe
  switch (currentScope.value.type) {
    case 'global':
      return Globe
    case 'region':
      return Map
    case 'branch':
      return Building2
    default:
      return Globe
  }
})

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

// Handle period change with loading state
const handlePeriodChange = async (period) => {
  if (currentPeriod.value === period || isLoading.value) return

  try {
    currentPeriod.value = period
    await loadDashboardData()
  } catch (e) {
    console.error('Error changing period:', e)
  }
}

// Refresh all data
const refreshData = async () => {
  if (isLoading.value) return
  await loadDashboardData()
}

// Watch for scope changes and refresh all data
watch(
  () => currentScope.value,
  () => {
    loadDashboardData()
  },
)

// Load initial data
onMounted(async () => {
  await loadDashboardData()
  hasLoadedInitialData.value = true
})
</script>

<style>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
