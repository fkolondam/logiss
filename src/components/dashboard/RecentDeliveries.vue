<template>
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">{{ t('deliveries.title') }}</h2>
      <div class="text-sm text-blue-700 row-span-2 leading-tight">
        ({{ t(`common.periods.${props.stats?.period || PERIODS.TODAY}`) }})
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <!-- Today's Deliveries Card -->
      <div class="bg-blue-50 rounded-lg p-4 grid grid-rows-5 h-40">
        <!-- Label (2 rows) -->
        <div class="text-sm text-blue-700 row-span-2 leading-tight">
          {{ t('deliveries.stats.todayDeliveries') }}
        </div>
        <!-- Metric (1 row) -->
        <div class="flex items-center gap-2">
          <div class="text-3xl font-bold text-blue-900">
            {{ loading ? '...' : stats?.total || 0 }}
          </div>
          <div v-if="stats?.trend" class="text-sm text-blue-600">
            {{ stats.trend > 0 ? '+' : '' }}{{ stats.trend }}%
          </div>
        </div>
        <!-- Stats Label (1 row) -->
        <div class="text-xs mt-1 text-blue-600">{{ t('deliveries.stats.fromLastWeek') }}</div>
        <!-- Drilldown (1 row) -->
        <div
          class="text-xs mt-3 text-right text-blue-600 hover:underline cursor-pointer"
          @click="navigateToDetails('todayDeliveries')"
        >
          {{ t('common.viewDetails') }} →
        </div>
      </div>

      <!-- Completion Rate Card -->
      <div class="bg-green-50 rounded-lg p-4 grid grid-rows-5 h-40">
        <!-- Label (2 rows) -->
        <div class="text-sm text-green-700 row-span-2 leading-tight">
          {{ t('deliveries.stats.completionRate') }}
        </div>
        <!-- Metric (1 row) -->
        <div class="flex items-center gap-2">
          <div class="text-3xl font-bold text-green-900">
            {{ loading ? '...' : calculateCompletionRate() }}%
          </div>
          <div v-if="stats?.completionTrend" class="text-sm text-green-600">
            {{ stats.completionTrend > 0 ? '+' : '' }}{{ stats.completionTrend }}%
          </div>
        </div>
        <!-- Stats Label (1 row) -->
        <div class="text-xs mt-1 text-green-600">{{ t('deliveries.stats.thisWeek') }}</div>
        <!-- Drilldown (1 row) -->
        <div class="text-xs mt-3 text-right text-green-600 hover:underline cursor-pointer">
          {{ t('common.viewDetails') }} →
        </div>
      </div>
    </div>

    <!-- Delivery Status Breakdown -->
    <div>
      <h3 class="text-sm font-medium text-gray-700 mb-4">{{ t('deliveries.deliveryStatus') }}</h3>
      <div class="space-y-4">
        <!-- Delivery Status Breakdown -->
        <template v-for="(config, status) in statusConfigs" :key="status">
          <div v-if="shouldShowStatus(status)" class="flex items-center gap-3">
            <div :class="config.iconBg" class="p-2 rounded-lg">
              <component :is="config.icon" class="w-5 h-5" :class="config.iconColor" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center mb-1">
                <div class="text-sm font-medium text-gray-700">
                  {{ t(`deliveries.status.${status}`) }}
                </div>
                <div class="text-sm text-gray-900 font-medium">
                  {{ stats?.[status] || 0 }}
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    class="h-1.5 rounded-full transition-all duration-500"
                    :class="config.barColor"
                    :style="{ width: `${calculatePercentage(status)}%` }"
                  ></div>
                </div>
                <div v-if="stats?.[`${status}Trend`]" class="text-xs" :class="config.textColor">
                  {{ stats[`${status}Trend`] > 0 ? '+' : '' }}{{ stats[`${status}Trend`] }}% from
                  last period
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import {
  PackageCheck,
  PackageX,
  PackageMinus,
  RefreshCw,
  AlertCircle,
  XCircle,
  DollarSign,
  FileX,
} from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'
import { PERIODS } from '../../constants/periods'
import { getJakartaDate } from '../../config/dateFormat'

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

// Status configuration for icons and colors
const statusConfigs = {
  'diterima - semua': {
    icon: PackageCheck,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    barColor: 'bg-green-500',
    textColor: 'text-green-600',
  },
  'diterima - sebagian': {
    icon: PackageMinus,
    iconBg: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    barColor: 'bg-yellow-500',
    textColor: 'text-yellow-600',
  },
  'minta kirim ulang': {
    icon: RefreshCw,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    barColor: 'bg-blue-500',
    textColor: 'text-blue-600',
  },
  batal: {
    icon: PackageX,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    barColor: 'bg-red-500',
    textColor: 'text-red-600',
  },
  'batal - toko tutup': {
    icon: XCircle,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    barColor: 'bg-red-400',
    textColor: 'text-red-600',
  },
  'batal - toko tidak dapat diakses': {
    icon: AlertCircle,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    barColor: 'bg-red-400',
    textColor: 'text-red-600',
  },
  'batal - tidak ada uang': {
    icon: DollarSign,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    barColor: 'bg-red-400',
    textColor: 'text-red-600',
  },
  'batal - salah order': {
    icon: FileX,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    barColor: 'bg-red-400',
    textColor: 'text-red-600',
  },
}

// Helper function to determine if status should be shown
const shouldShowStatus = (status) => {
  return (
    props.stats?.[status] > 0 ||
    status === 'diterima - semua' ||
    status === 'batal' ||
    status === 'minta kirim ulang'
  )
}

const calculateCompletionRate = () => {
  return props.stats?.completionRate || 0
}

const calculatePercentage = (status) => {
  if (!props.stats?.total || !props.stats?.[status]) return 0
  return Math.round((props.stats[status] / props.stats.total) * 100)
}

// Add debug logging with Jakarta timezone
watch(
  () => props.stats,
  (newStats) => {
    console.log('RecentDeliveries stats:', {
      total: newStats?.total,
      'diterima - semua': newStats?.['diterima - semua'],
      'diterima - sebagian': newStats?.['diterima - sebagian'],
      'minta kirim ulang': newStats?.['minta kirim ulang'],
      batal: newStats?.['batal'],
      'batal - toko tutup': newStats?.['batal - toko tutup'],
      'batal - toko tidak dapat diakses': newStats?.['batal - toko tidak dapat diakses'],
      'batal - tidak ada uang': newStats?.['batal - tidak ada uang'],
      'batal - salah order': newStats?.['batal - salah order'],
      trend: newStats?.trend,
      completionRate: newStats?.completionRate,
      completionTrend: newStats?.completionTrend,
      byPaymentMethod: newStats?.byPaymentMethod,
      scope: props.scope,
      period: newStats?.period,
      jakartaTime: getJakartaDate().toISOString().split('T')[0],
    })
  },
  { immediate: true },
)
</script>
