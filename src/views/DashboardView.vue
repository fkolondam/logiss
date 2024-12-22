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
      <template v-if="userStore.hasPermission('read_deliveries')">
        <RecentDeliveries
          :deliveries="recentDeliveries"
          :stats="deliveryStats"
          :loading="isLoading"
        />
      </template>
      <template v-if="userStore.hasPermission('read_expenses')">
        <ExpensesOverview
          v-model="selectedPeriod"
          :expenses="recentExpenses"
          :stats="expenseStats"
          :loading="isLoading"
        />
      </template>
      <template v-if="userStore.hasPermission('read_vehicles')">
        <VehicleStatus :vehicles="vehicles" :stats="vehicleStats" :loading="isLoading" />
      </template>
      <!-- Show message if no permissions -->
      <div
        v-if="!hasAnyPermissions"
        class="col-span-full flex items-center justify-center p-8 bg-gray-50 rounded-lg"
      >
        <div class="text-center">
          <AlertCircle class="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p class="text-gray-600">{{ t('dashboard.noAccess') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RefreshCw, AlertCircle } from 'lucide-vue-next'
import { useTranslations } from '../composables/useTranslations'
import { useUserStore } from '../stores/user'
import { useDashboardData } from '../composables/useDashboardData'
import RecentDeliveries from '../components/dashboard/RecentDeliveries.vue'
import ExpensesOverview from '../components/dashboard/ExpensesOverview.vue'
import VehicleStatus from '../components/dashboard/VehicleStatus.vue'

const { t } = useTranslations()
const userStore = useUserStore()
const selectedPeriod = ref('today')

// Check if user has any dashboard permissions
const hasAnyPermissions = computed(() => {
  return (
    userStore.hasPermission('read_deliveries') ||
    userStore.hasPermission('read_expenses') ||
    userStore.hasPermission('read_vehicles')
  )
})

// Get dashboard data using the composable
const {
  isLoading,
  error,
  deliveryStats,
  expenseStats,
  vehicleStats,
  recentDeliveries,
  recentExpenses,
  vehicles,
  loadDashboardData,
  refreshSection,
} = useDashboardData()

// Get current user's scope
const currentScope = computed(() => userStore.scope)

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

const refreshDashboard = () => {
  loadDashboardData()
}

// Watch for period changes and update expenses
watch(selectedPeriod, () => {
  if (!isLoading.value) {
    refreshSection('expenses')
  }
})

// Watch for scope changes and refresh all data
watch(
  () => currentScope.value,
  () => {
    loadDashboardData()
  },
)

// Load initial data
onMounted(loadDashboardData)
</script>
