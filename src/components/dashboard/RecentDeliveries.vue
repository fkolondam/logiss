<script setup>
import { computed } from 'vue'
import { Truck, AlertCircle, ArrowRight } from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'
import { useRouter } from 'vue-router'

// Props definition with validation
const props = defineProps({
  deliveries: {
    type: Array,
    default: () => [],
    validator: (value) => {
      return (
        Array.isArray(value) &&
        value.every(
          (delivery) => typeof delivery === 'object' && 'status' in delivery && 'date' in delivery,
        )
      )
    },
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: [String, Object],
    default: null,
  },
})

const { t } = useTranslations()
const router = useRouter()

// Computed delivery statistics
const deliveryStats = computed(() => {
  if (!Array.isArray(props.deliveries)) {
    console.warn('Invalid deliveries data provided')
    return {
      total: 0,
      completed: 0,
      partial: 0,
      pending: 0,
      cancelled: 0,
      todayCount: 0,
      successRate: 0,
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const stats = props.deliveries.reduce(
    (acc, delivery) => {
      if (!delivery || typeof delivery !== 'object') return acc

      acc.total++
      const status = delivery.status?.toLowerCase() || ''

      // Status counts
      if (status === 'diterima - semua') acc.completed++
      else if (status === 'diterima - sebagian') acc.partial++
      else if (status === 'kirim ulang') acc.pending++
      else if (status.startsWith('batal')) acc.cancelled++

      // Today's deliveries
      const deliveryDate = new Date(delivery.date)
      if (deliveryDate >= today) {
        acc.todayCount++
      }

      return acc
    },
    {
      total: 0,
      completed: 0,
      partial: 0,
      pending: 0,
      cancelled: 0,
      todayCount: 0,
    },
  )

  // Calculate success rate (completed + partial deliveries)
  stats.successRate = stats.total
    ? Math.round(((stats.completed + stats.partial) / stats.total) * 100)
    : 0

  return stats
})

// Computed status percentages
const statusPercentages = computed(() => {
  const stats = deliveryStats.value
  if (!stats.total) return { completed: 0, partial: 0, pending: 0, cancelled: 0 }

  return {
    completed: Math.round((stats.completed / stats.total) * 100),
    partial: Math.round((stats.partial / stats.total) * 100),
    pending: Math.round((stats.pending / stats.total) * 100),
    cancelled: Math.round((stats.cancelled / stats.total) * 100),
  }
})

// Navigation helper
const navigateToDeliveries = (params = {}) => {
  router.push({
    name: 'deliveries',
    query: params,
  })
}

// Status configuration for consistent styling
const statusConfig = {
  completed: {
    color: 'bg-green-600',
    barColor: 'bg-green-600',
    label: 'deliveries.status.diterima - semua',
  },
  partial: {
    color: 'bg-amber-500',
    barColor: 'bg-amber-500',
    label: 'deliveries.status.diterima - sebagian',
  },
  pending: {
    color: 'bg-blue-600',
    barColor: 'bg-blue-600',
    label: 'deliveries.status.kirim ulang',
  },
  cancelled: {
    color: 'bg-red-600',
    barColor: 'bg-red-600',
    label: 'deliveries.status.batal',
  },
}
</script>

<template>
  <div class="bg-white rounded-lg shadow" data-testid="recent-deliveries">
    <div class="p-4 border-b">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Truck class="w-5 h-5 text-blue-500" />
          <h2 class="text-base font-heading font-semibold tracking-tight">
            {{ t('dashboard.recentDeliveries') }}
          </h2>
        </div>
      </div>
    </div>

    <div class="p-4">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center gap-2 text-red-600 py-4">
        <AlertCircle class="w-5 h-5" />
        <span>{{ error }}</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!deliveries.length" class="text-gray-500 text-center py-4">
        {{ t('dashboard.noDeliveries') }}
      </div>

      <!-- Content -->
      <div v-else class="space-y-6">
        <!-- Key Metrics -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div class="bg-blue-50 rounded-lg p-3">
            <div class="grid grid-rows-[36px_48px_24px_32px] h-full">
              <div class="flex items-start h-[36px]">
                <div
                  class="text-[12px] text-gray-500 uppercase tracking-wider leading-[16px] line-clamp-3"
                >
                  {{ t('dashboard.deliveryStats.total') }}
                </div>
              </div>
              <div class="flex items-center">
                <div
                  class="text-4xl font-heading font-semibold text-blue-600 tabular-nums leading-none"
                >
                  {{ deliveryStats.total }}
                </div>
              </div>
              <div class="flex items-center"></div>
              <div class="flex items-end justify-end">
                <button
                  @click="navigateToDeliveries()"
                  class="flex items-center gap-1 text-[12px] font-medium text-blue-700 hover:text-blue-800 transition-colors"
                >
                  <span>{{ t('common.viewAll') }}</span>
                  <ArrowRight class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <!-- Success Rate -->
          <div class="bg-green-50 rounded-lg p-3">
            <div class="grid grid-rows-[36px_48px_24px_32px] h-full">
              <div class="flex items-start h-[36px]">
                <div
                  class="text-[12px] text-gray-500 uppercase tracking-wider leading-[16px] line-clamp-2"
                >
                  {{ t('dashboard.deliveryStats.succesRate') }}
                </div>
              </div>
              <div class="flex items-center">
                <div
                  class="text-4xl font-heading font-semibold text-green-600 tabular-nums leading-none"
                >
                  {{ deliveryStats.successRate }}%
                </div>
              </div>
              <div class="flex items-center"></div>
              <div class="flex items-end justify-end">
                <button
                  @click="navigateToDeliveries({ status: 'completed' })"
                  class="flex items-center gap-1 text-[12px] font-medium text-green-700 hover:text-green-800 transition-colors"
                >
                  <span>{{ t('common.details') }}</span>
                  <ArrowRight class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <!-- Cancellations -->
          <div class="bg-red-50 rounded-lg p-3">
            <div class="grid grid-rows-[36px_48px_24px_32px] h-full">
              <div class="flex items-start h-[36px]">
                <div
                  class="text-[12px] text-gray-500 uppercase tracking-wider leading-[16px] line-clamp-2"
                >
                  {{ t('dashboard.deliveryStats.cancelled') }}
                </div>
              </div>
              <div class="flex items-center">
                <div
                  class="text-4xl font-heading font-semibold text-red-600 tabular-nums leading-none"
                >
                  {{ deliveryStats.cancelled }}
                </div>
              </div>
              <div class="flex items-center"></div>
              <div class="flex items-end justify-end">
                <button
                  @click="navigateToDeliveries({ status: 'cancelled' })"
                  class="flex items-center gap-1 text-[12px] font-medium text-red-700 hover:text-red-800 transition-colors"
                >
                  <span>{{ t('common.details') }}</span>
                  <ArrowRight class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Breakdown -->
        <div class="space-y-1">
          <div class="text-sm font-heading font-semibold text-gray-900">
            {{ t('dashboard.deliveryStats.deliveryStatus') }}
          </div>
          <div class="space-y-0">
            <!-- Generate status bars dynamically -->
            <template v-for="(config, status) in statusConfig" :key="status">
              <div
                class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                @click="navigateToDeliveries({ status })"
              >
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-0.5">
                    <div class="flex items-center gap-1.5">
                      <span :class="['w-1.5 h-1.5 rounded-full', config.color]"></span>
                      <span class="text-sm text-gray-600 truncate">{{ t(config.label) }}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="text-base font-medium tabular-nums">{{
                        deliveryStats[status]
                      }}</span>
                      <span class="text-[10px] text-gray-500 tabular-nums"
                        >{{ statusPercentages[status] }}%</span
                      >
                    </div>
                  </div>
                  <div class="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div
                      :class="['h-1.5 rounded-full transition-all duration-300', config.barColor]"
                      :style="{ width: statusPercentages[status] + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
