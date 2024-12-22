<template>
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">{{ t('expenses.title') }}</h2>
      <div class="text-sm text-gray-500">
        {{ t(`expenses.periods.${props.stats?.period || PERIODS.TODAY}`) }}
      </div>
    </div>

    <!-- Total Amount -->
    <div class="bg-green-50 rounded-lg p-4 mb-6">
      <div class="text-sm text-green-700 mb-1">{{ t('expenses.total') }}</div>
      <div class="text-2xl font-bold text-green-900">
        {{ loading ? '...' : formatCurrency(stats?.totalAmount || 0) }}
      </div>
      <div v-if="stats?.trend" class="flex items-center gap-1 mt-1 text-sm">
        <TrendingUp v-if="stats.trend > 0" class="w-4 h-4 text-green-600" />
        <TrendingDown v-if="stats.trend < 0" class="w-4 h-4 text-red-600" />
        <span :class="stats.trend > 0 ? 'text-green-600' : 'text-red-600'">
          {{ Math.abs(stats.trend) }}%
          {{ stats.trend > 0 ? t('expenses.increased') : t('expenses.decreased') }}
        </span>
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
                v-if="stats?.byCategory?.[category.id]?.trend"
                class="text-xs"
                :class="category.textClass"
              >
                {{ stats.byCategory[category.id].trend > 0 ? '+' : ''
                }}{{ stats.byCategory[category.id].trend }}% from last period
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
const categories = [
  {
    id: 'Fuel',
    label: t('expenses.categories.fuel'),
    icon: Fuel,
    iconClass: 'bg-blue-50 text-blue-600',
    barClass: 'bg-blue-500',
    textClass: 'text-blue-600',
  },
  {
    id: 'Maintenance',
    label: t('expenses.categories.maintenance'),
    icon: Wrench,
    iconClass: 'bg-orange-50 text-orange-600',
    barClass: 'bg-orange-500',
    textClass: 'text-orange-600',
  },
  {
    id: 'Vehicle License',
    label: t('expenses.categories.vehicleLicense'),
    icon: ShieldCheck,
    iconClass: 'bg-green-50 text-green-600',
    barClass: 'bg-green-500',
    textClass: 'text-green-600',
  },
  {
    id: 'Labour',
    label: t('expenses.categories.labour'),
    icon: Users,
    iconClass: 'bg-pink-50 text-pink-600',
    barClass: 'bg-pink-500',
    textClass: 'text-pink-600',
  },
  {
    id: 'Parking-Tol-Retribution',
    label: t('expenses.categories.parkingToll'),
    icon: ParkingSquare,
    iconClass: 'bg-indigo-50 text-indigo-600',
    barClass: 'bg-indigo-500',
    textClass: 'text-indigo-600',
  },
]

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
