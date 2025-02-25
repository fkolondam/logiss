<template>
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">{{ t('expenses.title') }}</h2>
      <div class="text-sm text-green-700 row-span-2 leading-tight">
        ({{ t(`common.periods.${props.stats?.period || PERIODS.TODAY}`) }})
      </div>
    </div>

    <!-- Total Amount -->
    <div class="bg-green-50/80 rounded-lg p-4 mb-6 flex flex-col h-[160px]">
      <!-- Header (2 rows) -->
      <div class="mb-3 min-h-[40px]">
        <h3 class="text-sm font-medium text-green-800/90 leading-snug">
          {{ t('expenses.total') }}
        </h3>
      </div>

      <!-- Content -->
      <div class="flex-1">
        <div class="flex items-baseline gap-2">
          <div class="text-3xl font-semibold text-green-900">
            {{ loading ? '...' : formatCurrency(props.stats?.totalAmount || 0) }}
          </div>
          <div v-if="props.stats?.trend" class="flex items-center gap-1">
            <TrendingUp v-if="props.stats.trend > 0" class="w-4 h-4 text-green-700" />
            <TrendingDown v-if="props.stats.trend < 0" class="w-4 h-4 text-red-700" />
            <span
              class="text-sm font-medium"
              :class="props.stats.trend > 0 ? 'text-green-700' : 'text-red-700'"
            >
              {{ Math.abs(props.stats.trend) }}%
            </span>
          </div>
        </div>
        <div class="text-xs text-green-600/90 mt-1">
          {{ props.stats?.trend > 0 ? t('expenses.increased') : t('expenses.decreased') }}
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-auto pt-2 border-t border-green-100">
        <button
          class="text-xs font-medium text-green-600 hover:text-green-700 transition-colors flex items-center gap-0.5"
        >
          {{ t('common.viewDetails') }}
          <span class="text-[10px]">→</span>
        </button>
      </div>
    </div>

    <!-- Expense Breakdown -->
    <div>
      <h3 class="text-sm font-medium text-gray-700 mb-4">{{ t('expenses.breakdown') }}</h3>

      <!-- Categories -->
      <div class="space-y-4">
        <div v-for="category in categories" :key="category.id" class="flex items-center gap-3">
          <div :class="category.iconClass" class="p-2 rounded-lg">
            <component :is="category.icon" class="w-5 h-5" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <div class="text-sm font-medium text-gray-700">
                {{ category.label }}
              </div>
              <div class="text-sm text-gray-900 font-medium">
                {{ loading ? '...' : formatCurrency(getCategoryAmount(category.id)) }}
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <div class="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  class="h-1.5 rounded-full transition-all duration-500"
                  :class="category.barClass"
                  :style="{ width: `${getCategoryPercentage(category.id)}%` }"
                ></div>
              </div>
              <div
                v-if="props.stats?.byCategory?.[category.id]?.trend"
                class="text-xs"
                :class="category.textClass"
              >
                {{ props.stats.byCategory[category.id].trend > 0 ? '+' : ''
                }}{{ props.stats.byCategory[category.id].trend }}% from last period
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Fuel,
  Wrench,
  ShieldCheck,
  Package,
  TrendingUp,
  TrendingDown,
  ParkingSquare,
  Ticket,
  Receipt,
  Users,
} from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'

const { t } = useTranslations()

import { PERIODS } from '../../constants/periods'

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

// Categories configuration - matching expenseCategoryConfig from branchData.js
const categories = computed(() => [
  {
    id: 'BBM',
    label: t('expenses.categories.fuel'),
    icon: Fuel,
    iconClass: 'bg-blue-50 text-blue-600',
    barClass: 'bg-blue-500',
    textClass: 'text-blue-600',
  },
  {
    id: 'PARKIR',
    label: t('expenses.categories.parking'),
    icon: ParkingSquare,
    iconClass: 'bg-indigo-50 text-indigo-600',
    barClass: 'bg-indigo-500',
    textClass: 'text-indigo-600',
  },
  {
    id: 'TOL',
    label: t('expenses.categories.toll'),
    icon: Ticket,
    iconClass: 'bg-green-50 text-green-600',
    barClass: 'bg-green-500',
    textClass: 'text-green-600',
  },
  {
    id: 'MAINTENANCE',
    label: t('expenses.categories.maintenance'),
    icon: Wrench,
    iconClass: 'bg-orange-50 text-orange-600',
    barClass: 'bg-orange-500',
    textClass: 'text-orange-600',
  },
  {
    id: 'KULI BONGKAR',
    label: t('expenses.categories.labour'),
    icon: Users,
    iconClass: 'bg-pink-50 text-pink-600',
    barClass: 'bg-pink-500',
    textClass: 'text-pink-600',
  },
  {
    id: 'RETRIBUSI',
    label: t('expenses.categories.retribution'),
    icon: Ticket,
    iconClass: 'bg-cyan-50 text-cyan-600',
    barClass: 'bg-cyan-500',
    textClass: 'text-cyan-600',
  },
  {
    id: 'SURAT DAN PAJAK KENDARAAN',
    label: t('expenses.categories.vehicleLicense'),
    icon: ShieldCheck,
    iconClass: 'bg-purple-50 text-purple-600',
    barClass: 'bg-purple-500',
    textClass: 'text-purple-600',
  },
])

// Helper functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const getCategoryAmount = (categoryId) => {
  if (!props.stats?.byCategory?.[categoryId]) return 0
  return props.stats.byCategory[categoryId].amount || 0
}

const getCategoryPercentage = (categoryId) => {
  if (!props.stats?.totalAmount || !props.stats?.byCategory?.[categoryId]?.amount) return 0
  return Math.round((props.stats.byCategory[categoryId].amount / props.stats.totalAmount) * 100)
}
</script>
