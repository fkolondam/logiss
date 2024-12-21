<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
    <!-- Loading State -->
    <template v-if="loading">
      <div v-for="i in 3" :key="i" class="bg-white rounded-lg p-4 shadow animate-pulse">
        <div class="flex items-start justify-between">
          <div class="space-y-2">
            <div class="h-8 bg-gray-200 rounded w-24"></div>
            <div class="h-4 bg-gray-200 rounded w-32"></div>
            <div class="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          <div class="rounded-full p-2 bg-gray-200 h-12 w-12"></div>
        </div>
      </div>
    </template>

    <!-- Error State -->
    <div v-else-if="error" class="col-span-full bg-red-50 p-4 rounded-lg">
      <div class="flex items-center gap-2 text-red-600">
        <AlertCircle class="w-5 h-5" />
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Total Deliveries -->
      <div class="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow duration-200">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-xl sm:text-2xl font-bold mb-1">{{ displayStats.total }}</h3>
            <p class="text-sm text-gray-500">{{ t('deliveries.stats.total') }}</p>
            <p class="text-xs text-gray-400 mt-1">
              {{ t('deliveries.stats.successRate', { rate: displayStats.successRate }) }}
            </p>
          </div>
          <div class="rounded-full p-2 bg-blue-500 bg-opacity-10">
            <Package class="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-gray-100">
          <div class="flex items-center gap-1.5">
            <ArrowUpRight
              :class="[
                'w-3.5 h-3.5',
                displayStats.successRate >= displayStats.previousSuccessRate
                  ? 'text-green-500'
                  : 'text-red-500',
              ]"
            />
            <span class="text-xs text-gray-500">
              {{
                t('deliveries.stats.vsLastMonth', {
                  change: Math.abs(displayStats.successRate - displayStats.previousSuccessRate),
                })
              }}
            </span>
          </div>
          <div class="text-[10px] text-gray-400 mt-1">
            {{ displayStats.displayRange }}
          </div>
        </div>
      </div>

      <!-- Completed Deliveries -->
      <div class="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow duration-200">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-xl sm:text-2xl font-bold mb-1">{{ displayStats.completed }}</h3>
            <p class="text-sm text-gray-500">{{ t('deliveries.stats.completed') }}</p>
            <p class="text-xs text-gray-400 mt-1">
              {{
                t('deliveries.stats.fromTotal', {
                  percentage: Math.round((displayStats.completed / displayStats.total) * 100) || 0,
                })
              }}
            </p>
          </div>
          <div class="rounded-full p-2 bg-green-500 bg-opacity-10">
            <CheckCircle2 class="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-gray-100">
          <div class="flex items-center gap-1.5">
            <ArrowUpRight
              :class="[
                'w-3.5 h-3.5',
                displayStats.completed >= displayStats.previousCompleted
                  ? 'text-green-500'
                  : 'text-red-500',
              ]"
            />
            <span class="text-xs text-gray-500">
              {{
                t('deliveries.stats.vsLastMonth', {
                  change: Math.abs(displayStats.completed - displayStats.previousCompleted),
                })
              }}
            </span>
          </div>
          <div class="text-[10px] text-gray-400 mt-1">
            {{ displayStats.previousDisplayRange }}
          </div>
        </div>
      </div>

      <!-- Pending Deliveries -->
      <div class="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow duration-200">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-xl sm:text-2xl font-bold mb-1">{{ displayStats.pending }}</h3>
            <p class="text-sm text-gray-500">{{ t('deliveries.stats.pending') }}</p>
            <p class="text-xs text-gray-400 mt-1">
              {{ t('deliveries.stats.needsAttention') }}
            </p>
          </div>
          <div class="rounded-full p-2 bg-amber-500 bg-opacity-10">
            <Clock class="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-gray-100">
          <div class="flex items-center gap-1.5">
            <ArrowUpRight
              :class="[
                'w-3.5 h-3.5',
                displayStats.pending <= displayStats.previousPending
                  ? 'text-green-500'
                  : 'text-red-500',
              ]"
            />
            <span class="text-xs text-gray-500">
              {{
                t('deliveries.stats.vsLastMonth', {
                  change: Math.abs(displayStats.pending - displayStats.previousPending),
                })
              }}
            </span>
          </div>
          <div class="text-[10px] text-gray-400 mt-1">
            {{ displayStats.previousDisplayRange }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Package, CheckCircle2, Clock, AlertCircle, ArrowUpRight } from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'

const { t } = useTranslations()

const props = defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({
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
    }),
    validator: (value) => {
      if (!value) return false
      return (
        typeof value === 'object' &&
        typeof value.total === 'number' &&
        typeof value.completed === 'number' &&
        typeof value.pending === 'number' &&
        typeof value.successRate === 'number'
      )
    },
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
})

// Computed property to handle null/undefined stats gracefully
const displayStats = computed(() => ({
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
  ...props.stats,
}))
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.hover\:shadow-md:hover {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.transition-shadow {
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>
