<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
    <div
      v-for="stat in computedStats"
      :key="stat.translationKey"
      :class="['bg-white rounded-lg p-4 shadow', { 'animate-pulse': loading }]"
    >
      <div class="flex items-start justify-between">
        <div>
          <h3 class="text-xl sm:text-2xl font-bold mb-1">
            <span v-if="!loading">{{ stat.value }}</span>
            <span v-else class="block h-8 w-16 bg-gray-200 rounded"></span>
          </h3>
          <p class="text-sm text-gray-500">{{ t(stat.translationKey) }}</p>
          <p class="text-xs text-gray-400 mt-1">
            {{ t(stat.subtitleKey) }}
            <span v-if="!loading && stat.trend" :class="getTrendClass(stat.trend)">
              {{ formatTrend(stat.trend) }}
            </span>
            <span v-else-if="loading" class="block h-4 w-12 bg-gray-200 rounded mt-1"></span>
          </p>
        </div>
        <div :class="`rounded-full p-2 bg-opacity-10 ${stat.iconBg}`">
          <component
            :is="stat.icon"
            class="w-8 h-8"
            :class="[stat.iconColor, { 'opacity-50': loading }]"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Package, Truck, Activity } from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'

const { t } = useTranslations()

const props = defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const getTrendClass = (trend) => {
  if (!trend) return ''
  return trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : ''
}

const formatTrend = (trend) => {
  if (!trend) return ''
  return `${trend > 0 ? '+' : ''}${trend}%`
}

const computedStats = computed(() => [
  {
    translationKey: 'deliveries.stats.todayDeliveries',
    value: props.stats.total || 0,
    subtitleKey: 'deliveries.stats.completionRate',
    trend: props.stats.completionTrend,
    icon: Package,
    iconBg: 'bg-blue-500',
    iconColor: 'text-blue-500',
  },
  {
    translationKey: 'deliveries.stats.thisWeek',
    value: props.stats.receivedAll || 0,
    subtitleKey: 'deliveries.stats.fromLastWeek',
    trend: props.stats.receivedTrend,
    icon: Truck,
    iconBg: 'bg-green-500',
    iconColor: 'text-green-500',
  },
  {
    translationKey: 'deliveries.stats.thisMonth',
    value: props.stats.successRate || 0,
    subtitleKey: 'deliveries.stats.monthlyTarget',
    trend: props.stats.trend,
    icon: Activity,
    iconBg: 'bg-purple-500',
    iconColor: 'text-purple-500',
  },
])
</script>
