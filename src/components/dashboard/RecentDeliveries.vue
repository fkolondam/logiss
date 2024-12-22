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
        <!-- Diterima - Semua -->
        <div class="flex items-center gap-3">
          <div class="bg-green-50 p-2 rounded-lg">
            <PackageCheck class="w-5 h-5 text-green-600" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <div class="text-sm font-medium text-gray-700">
                {{ t('deliveries.status.diterima - semua') }}
              </div>
              <div class="text-sm text-gray-900 font-medium">{{ stats?.receivedAll || 0 }}</div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5">
              <div
                class="h-1.5 rounded-full bg-green-500 transition-all duration-500"
                :style="{ width: `${calculatePercentage('receivedAll')}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Parsial -->
        <div class="flex items-center gap-3">
          <div class="bg-yellow-50 p-2 rounded-lg">
            <PackageMinus class="w-5 h-5 text-yellow-600" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <div class="text-sm font-medium text-gray-700">
                {{ t('deliveries.status.diterima - sebagian') }}
              </div>
              <div class="text-sm text-gray-900 font-medium">{{ stats?.partial || 0 }}</div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5">
              <div
                class="h-1.5 rounded-full bg-yellow-500 transition-all duration-500"
                :style="{ width: `${calculatePercentage('partial')}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Kirim Ulang -->
        <div class="flex items-center gap-3">
          <div class="bg-blue-50 p-2 rounded-lg">
            <RefreshCw class="w-5 h-5 text-blue-600" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <div class="text-sm font-medium text-gray-700">
                {{ t('deliveries.status.kirim ulang') }}
              </div>
              <div class="text-sm text-gray-900 font-medium">{{ stats?.resend || 0 }}</div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5">
              <div
                class="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                :style="{ width: `${calculatePercentage('resend')}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Batal -->
        <div class="flex items-center gap-3">
          <div class="bg-red-50 p-2 rounded-lg">
            <PackageX class="w-5 h-5 text-red-600" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <div class="text-sm font-medium text-gray-700">
                {{ t('deliveries.status.batal') }}
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
import { PackageCheck, PackageX, PackageMinus, RefreshCw } from 'lucide-vue-next'
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
  scope: {
    type: Object,
    required: true,
  },
})

// Stats are already filtered by scope in useDashboardData composable
const filteredStats = computed(() => props.stats)

const calculateCompletionRate = () => {
  if (!filteredStats.value?.total || !filteredStats.value?.receivedAll) return 0
  return Math.round((filteredStats.value.receivedAll / filteredStats.value.total) * 100)
}

const calculatePercentage = (status) => {
  if (!filteredStats.value?.total || !filteredStats.value?.[status]) return 0
  return Math.round((filteredStats.value[status] / filteredStats.value.total) * 100)
}
</script>
