<template>
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">{{ t('expenses.title') }}</h2>
      <div class="text-sm text-gray-500">{{ t(`expenses.periods.${modelValue}`) }}</div>
    </div>

    <!-- Total Amount -->
    <div class="bg-green-50 rounded-lg p-4 mb-6">
      <div class="text-sm text-green-700 mb-1">{{ t('expenses.total') }}</div>
      <div class="text-2xl font-bold text-green-900">
        {{ loading ? '...' : formatCurrency(stats?.total || 0) }}
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
                {{ t(`expenses.categories.${category.id}`) }}
              </div>
              <div class="text-sm text-gray-900 font-medium">
                {{ loading ? '...' : formatCurrency(getCategoryAmount(category.id)) }}
              </div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5">
              <div
                class="h-1.5 rounded-full transition-all duration-500"
                :class="category.barClass"
                :style="{ width: `${getCategoryPercentage(category.id)}%` }"
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

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  expenses: {
    type: Array,
    default: () => [],
  },
  stats: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

// Categories configuration
const categories = [
  {
    id: 'fuel',
    icon: Fuel,
    iconClass: 'bg-blue-50 text-blue-600',
    barClass: 'bg-blue-500',
  },
  {
    id: 'maintenance',
    icon: Wrench,
    iconClass: 'bg-orange-50 text-orange-600',
    barClass: 'bg-orange-500',
  },

  {
    id: 'parking',
    icon: ParkingSquare,
    iconClass: 'bg-cyan-50 text-cyan-600',
    barClass: 'bg-cyan-500',
  },
  {
    id: 'toll',
    icon: ParkingSquare, // Changed from Road to ParkingSquare
    iconClass: 'bg-indigo-50 text-indigo-600',
    barClass: 'bg-indigo-500',
  },
  {
    id: 'retribution',
    icon: Receipt,
    iconClass: 'bg-teal-50 text-teal-600',
    barClass: 'bg-teal-500',
  },
  {
    id: 'labour',
    icon: Users,
    iconClass: 'bg-pink-50 text-pink-600',
    barClass: 'bg-pink-500',
  },
  {
    id: 'insurance',
    icon: ShieldCheck,
    iconClass: 'bg-green-50 text-green-600',
    barClass: 'bg-green-500',
  },
  {
    id: 'others',
    icon: Package,
    iconClass: 'bg-purple-50 text-purple-600',
    barClass: 'bg-purple-500',
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
  if (!props.stats?.categories) return 0
  return props.stats.categories[categoryId] || 0
}

const getCategoryPercentage = (categoryId) => {
  if (!props.stats?.total || !props.stats?.categories) return 0
  const amount = props.stats.categories[categoryId] || 0
  return Math.round((amount / props.stats.total) * 100)
}
</script>
