<template>
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">{{ t('vehicles.title') }}</h2>
      <div class="text-sm text-gray-500">
        {{ t('vehicles.stats.total') }}: {{ stats?.total || 0 }}
      </div>
    </div>

    <!-- Rest of the template remains unchanged -->
    <!-- Status Overview -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <!-- Utilization Card -->
      <div class="bg-green-50 rounded-lg p-4 grid grid-rows-5 h-40">
        <!-- Label (2 rows) -->
        <div class="text-sm text-green-700 row-span-2 leading-tight">
          {{ t('vehicles.stats.utilization') }}
        </div>
        <!-- Metric (1 row) -->
        <div class="flex items-center gap-2">
          <div class="text-3xl font-bold text-green-900">
            {{ loading ? '...' : calculateUtilizationRate() }}%
          </div>
          <div v-if="stats?.utilizationTrend" class="text-sm text-green-600">
            {{ stats.utilizationTrend > 0 ? '+' : '' }}{{ stats.utilizationTrend }}%
          </div>
        </div>
        <!-- Stats Label (1 row) -->
        <div class="text-xs mt-1 text-green-600">{{ t('vehicles.stats.utilization') }}</div>
        <!-- Drilldown (1 row) -->
        <div
          class="text-xs mt-3 text-right text-green-600 hover:underline cursor-pointer"
          @click="navigateToDetails('utilization')"
        >
          {{ t('common.viewDetails') }} →
        </div>
      </div>

      <!-- Maintenance Card -->
      <div class="bg-orange-50 rounded-lg p-4 grid grid-rows-5 h-40">
        <!-- Label (2 rows) -->
        <div class="text-sm text-orange-700 row-span-2 leading-tight">
          {{ t('vehicles.stats.maintenanceRate') }}
        </div>
        <!-- Metric (1 row) -->
        <div class="flex items-center gap-2">
          <div class="text-3xl font-bold text-orange-900">
            {{ loading ? '...' : calculateMaintenanceRate() }}%
          </div>
          <div v-if="stats?.maintenanceTrend" class="text-sm text-orange-600">
            {{ stats.maintenanceTrend > 0 ? '+' : '' }}{{ stats.maintenanceTrend }}%
          </div>
        </div>
        <!-- Stats Label (1 row) -->
        <div class="text-xs mt-1 text-orange-600">{{ t('vehicles.stats.maintenanceRate') }}</div>
        <!-- Drilldown (1 row) -->
        <div class="text-xs mt-3 text-right text-orange-600 hover:underline cursor-pointer">
          {{ t('common.viewDetails') }} →
        </div>
      </div>
    </div>

    <!-- Vehicle Status Breakdown -->
    <div class="space-y-6">
      <!-- Active vs Maintenance -->
      <div>
        <h3 class="text-sm font-medium text-gray-700 mb-4">{{ t('vehicles.status.title') }}</h3>
        <div class="space-y-4">
          <!-- Active Vehicles -->
          <div class="flex items-center gap-3">
            <div class="bg-green-50 p-2 rounded-lg">
              <Truck class="w-5 h-5 text-green-600" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center mb-1">
                <div class="text-sm font-medium text-gray-700">
                  {{ t('vehicles.status.active') }}
                </div>
                <div class="text-sm text-gray-900 font-medium">
                  {{ stats?.active || 0 }}
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    class="h-1.5 rounded-full bg-green-500 transition-all duration-500"
                    :style="{ width: `${calculatePercentage('active')}%` }"
                  ></div>
                </div>
                <div v-if="stats?.activeTrend" class="text-xs text-green-600">
                  {{ stats.activeTrend > 0 ? '+' : '' }}{{ stats.activeTrend }}%
                </div>
              </div>
            </div>
          </div>

          <!-- Maintenance Vehicles -->
          <div class="flex items-center gap-3">
            <div class="bg-orange-50 p-2 rounded-lg">
              <Wrench class="w-5 h-5 text-orange-600" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center mb-1">
                <div class="text-sm font-medium text-gray-700">
                  {{ t('vehicles.stats.maintenanceVehicles') }}
                </div>
                <div class="text-sm text-gray-900 font-medium">
                  {{ stats?.maintenance || 0 }}
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    class="h-1.5 rounded-full bg-orange-500 transition-all duration-500"
                    :style="{ width: `${calculatePercentage('maintenance')}%` }"
                  ></div>
                </div>
                <div v-if="stats?.maintenanceTrend" class="text-xs text-orange-600">
                  {{ stats.maintenanceTrend > 0 ? '+' : '' }}{{ stats.maintenanceTrend }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fuel Status -->
      <div>
        <h3 class="text-sm font-medium text-gray-700 mb-4">{{ t('vehicles.fuel') }}</h3>
        <div class="space-y-4">
          <!-- Low Fuel Level -->
          <div class="flex items-center gap-3">
            <div class="bg-blue-50 p-2 rounded-lg">
              <Fuel class="w-5 h-5 text-blue-600" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center mb-1">
                <div class="text-sm font-medium text-gray-700">
                  {{ t('vehicles.stats.needRefuel') }}
                </div>
                <div class="text-sm text-gray-900 font-medium">
                  {{ stats?.lowFuel || 0 }}
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    class="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                    :style="{ width: `${calculatePercentage('lowFuel')}%` }"
                  ></div>
                </div>
                <div v-if="stats?.fuelTrend" class="text-xs text-blue-600">
                  {{ stats.fuelTrend > 0 ? '+' : '' }}{{ stats.fuelTrend }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Document & Service Status -->
      <div>
        <h3 class="text-sm font-medium text-gray-700 mb-4">{{ t('vehicles.documents.title') }}</h3>
        <div class="space-y-4">
          <!-- Vehicle Documents -->
          <div class="flex items-center gap-3">
            <div class="bg-purple-50 p-2 rounded-lg">
              <FileText class="w-5 h-5 text-purple-600" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center mb-1">
                <div class="text-sm font-medium text-gray-700">
                  {{ t('vehicles.documents.expiring') }}
                </div>
                <div class="text-sm text-gray-900 font-medium">
                  {{ stats?.expiringDocs || 0 }}
                </div>
              </div>
              <div class="text-xs text-gray-500">
                {{ t('vehicles.documents.nextExpiry') }}:
                {{ formatDate(stats?.nextDocExpiry) }}
              </div>
            </div>
          </div>

          <!-- Service Due -->
          <div class="flex items-center gap-3">
            <div class="bg-yellow-50 p-2 rounded-lg">
              <Settings class="w-5 h-5 text-yellow-600" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center mb-1">
                <div class="text-sm font-medium text-gray-700">
                  {{ t('vehicles.service.due') }}
                </div>
                <div class="text-sm text-gray-900 font-medium">
                  {{ stats?.serviceDue || 0 }}
                </div>
              </div>
              <div class="text-xs text-gray-500">
                {{ t('vehicles.service.nextDue') }}: {{ formatDate(stats?.nextServiceDue) }}
              </div>
            </div>
          </div>

          <!-- Document Warnings -->
          <div v-if="stats?.expiringDocs || stats?.serviceDue" class="mt-2">
            <div class="flex items-center gap-2 text-red-600 text-xs">
              <AlertCircle class="w-4 h-4" />
              <span>{{ t('vehicles.documents.warning') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { Truck, Fuel, Wrench, FileText, AlertCircle, Settings } from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'

const { t } = useTranslations()

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const props = defineProps({
  stats: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

// Make stats reactive to ensure updates trigger re-renders
const stats = computed(() => props.stats || {})

const calculateUtilizationRate = () => {
  if (!stats.value.total || !stats.value.active) return 0
  return Math.round((stats.value.active / stats.value.total) * 100)
}

const calculateMaintenanceRate = () => {
  if (!stats.value.total || !stats.value.maintenance) return 0
  return Math.round((stats.value.maintenance / stats.value.total) * 100)
}

const calculatePercentage = (status) => {
  if (!stats.value.total || !stats.value[status]) return 0
  return Math.round((stats.value[status] / stats.value.total) * 100)
}

// Add debug logging
watch(
  () => props.stats,
  (newStats) => {
    console.log('Vehicle stats:', {
      total: newStats?.total,
      active: newStats?.active,
      maintenance: newStats?.maintenance,
      lowFuel: newStats?.lowFuel,
      expiringDocs: newStats?.expiringDocs,
      serviceDue: newStats?.serviceDue,
      nextDocExpiry: newStats?.nextDocExpiry,
      nextServiceDue: newStats?.nextServiceDue,
      utilizationTrend: newStats?.utilizationTrend,
      maintenanceTrend: newStats?.maintenanceTrend,
      activeTrend: newStats?.activeTrend,
      fuelTrend: newStats?.fuelTrend,
      byBranch: newStats?.byBranch,
      period: newStats?.period,
    })
  },
  { immediate: true },
)
</script>
