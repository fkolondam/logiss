<template>
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">{{ t('deliveries.title') }}</h2>
      <div class="text-sm text-gray-500">{{ t('deliveries.today') }}</div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-blue-50 rounded-lg p-4">
        <div class="text-sm text-blue-700 mb-1">{{ t('deliveries.stats.todayDeliveries') }}</div>
        <div class="flex items-end gap-2">
          <div class="text-2xl font-bold text-blue-900">
            {{ loading ? '...' : stats?.total || 0 }}
          </div>
          <div v-if="stats?.trend" class="text-sm text-blue-600 mb-1">
            {{ stats.trend > 0 ? '+' : '' }}{{ stats.trend }}%
          </div>
        </div>
        <div class="text-xs text-blue-600 mt-1">{{ t('deliveries.stats.fromLastWeek') }}</div>
      </div>
      <div class="bg-green-50 rounded-lg p-4">
        <div class="text-sm text-green-700 mb-1">{{ t('deliveries.stats.completionRate') }}</div>
        <div class="flex items-end gap-2">
          <div class="text-2xl font-bold text-green-900">
            {{ loading ? '...' : calculateCompletionRate() }}%
          </div>
          <div v-if="stats?.completionTrend" class="text-sm text-green-600 mb-1">
            {{ stats.completionTrend > 0 ? '+' : '' }}{{ stats.completionTrend }}%
          </div>
        </div>
        <div class="text-xs text-green-600 mt-1">{{ t('deliveries.stats.thisWeek') }}</div>
      </div>
    </div>

    <!-- Delivery Status Breakdown -->
    <div>
      <h3 class="text-sm font-medium text-gray-700 mb-4">{{ t('deliveries.deliveryStatus') }}</h3>
      <div class="space-y-4">
        <!-- Completed -->
        <div class="flex items-center gap-3">
          <div class="bg-green-50 p-2 rounded-lg">
            <PackageCheck class="w-5 h-5 text-green-600" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <div class="text-sm font-medium text-gray-700">
                {{ t('deliveries.status.completed') }}
              </div>
              <div class="text-sm text-gray-900 font-medium">{{ stats?.completed || 0 }}</div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5">
              <div
                class="h-1.5 rounded-full bg-green-500 transition-all duration-500"
                :style="{ width: `${calculatePercentage('completed')}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- In Transit -->
        <div class="flex items-center gap-3">
          <div class="bg-blue-50 p-2 rounded-lg">
            <Truck class="w-5 h-5 text-blue-600" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <div class="text-sm font-medium text-gray-700">
                {{ t('deliveries.status.in_transit') }}
              </div>
              <div class="text-sm text-gray-900 font-medium">{{ stats?.inTransit || 0 }}</div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5">
              <div
                class="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                :style="{ width: `${calculatePercentage('inTransit')}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Pending -->
        <div class="flex items-center gap-3">
          <div class="bg-orange-50 p-2 rounded-lg">
            <Clock class="w-5 h-5 text-orange-600" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <div class="text-sm font-medium text-gray-700">
                {{ t('deliveries.status.pending') }}
              </div>
              <div class="text-sm text-gray-900 font-medium">{{ stats?.pending || 0 }}</div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5">
              <div
                class="h-1.5 rounded-full bg-orange-500 transition-all duration-500"
                :style="{ width: `${calculatePercentage('pending')}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Cancelled -->
        <div class="flex items-center gap-3">
          <div class="bg-red-50 p-2 rounded-lg">
            <PackageX class="w-5 h-5 text-red-600" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <div class="text-sm font-medium text-gray-700">
                {{ t('deliveries.status.cancelled') }}
              </div>
              <div class="text-sm text-gray-900 font-medium">{{ stats?.cancelled || 0 }}</div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5">
              <div
                class="h-1.5 rounded-full bg-red-500 transition-all duration-500"
                :style="{ width: `${calculatePercentage('cancelled')}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { PackageCheck, PackageX, Truck, Clock } from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'

const { t } = useTranslations()

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

const calculateCompletionRate = () => {
  if (!props.stats?.total || !props.stats?.completed) return 0
  return Math.round((props.stats.completed / props.stats.total) * 100)
}

const calculatePercentage = (status) => {
  if (!props.stats?.total || !props.stats?.[status]) return 0
  return Math.round((props.stats[status] / props.stats.total) * 100)
}
</script>
