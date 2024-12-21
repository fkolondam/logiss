<script setup>
import { computed } from 'vue'
import { DollarSign, AlertCircle } from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'

// Props definition with validation
const props = defineProps({
  expenses: {
    type: Object,
    default: () => ({
      total: 0,
      count: 0,
      byCategory: {},
      previousTotal: 0,
    }),
    validator: (value) => {
      return (
        typeof value === 'object' &&
        'total' in value &&
        'count' in value &&
        'byCategory' in value &&
        'previousTotal' in value
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
  modelValue: {
    type: String,
    default: 'today',
  },
})

const emit = defineEmits(['update:modelValue'])

const { t } = useTranslations()

// Computed properties
const totalExpenses = computed(() => props.expenses?.total || 0)
const previousTotal = computed(() => props.expenses?.previousTotal || 0)
const expensesByCategory = computed(() => props.expenses?.byCategory || {})

// Period options
const periodOptions = [
  { value: 'today', label: t('expenses.periods.today') },
  { value: 'week', label: t('expenses.periods.thisWeek') },
  { value: 'month', label: t('expenses.periods.thisMonth') },
]

// Change period handler
const handlePeriodChange = (period) => {
  emit('update:modelValue', period)
}

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Calculate percentage change
const percentageChange = computed(() => {
  if (!previousTotal.value || !totalExpenses.value) return 0
  return Math.round(((totalExpenses.value - previousTotal.value) / previousTotal.value) * 100)
})

// Category configuration for consistent styling
const categoryConfig = {
  fuel: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
    icon: DollarSign,
  },
  maintenance: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    icon: DollarSign,
  },
  insurance: {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-100',
    icon: DollarSign,
  },
  others: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-100',
    icon: DollarSign,
  },
}
</script>

<template>
  <div class="bg-white rounded-lg shadow" data-testid="expenses-overview">
    <div class="p-4 border-b">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <DollarSign class="w-5 h-5 text-green-500" />
          <h2 class="text-base font-heading font-semibold tracking-tight">
            {{ t('expenses.title') }}
          </h2>
        </div>

        <!-- Period Selector -->
        <div class="flex items-center gap-2">
          <button
            v-for="option in periodOptions"
            :key="option.value"
            :class="[
              'px-2.5 py-1.5 text-sm font-medium rounded-md transition-colors',
              modelValue === option.value
                ? 'bg-green-50 text-green-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
            ]"
            @click="handlePeriodChange(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="p-4">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center gap-2 text-red-600 py-4">
        <AlertCircle class="w-5 h-5" />
        <span>{{ error }}</span>
      </div>

      <!-- Content -->
      <div v-else class="space-y-6">
        <!-- Total Expenses -->
        <div class="bg-green-50 rounded-lg p-4">
          <div class="text-xs text-gray-500 uppercase tracking-wider mb-1">
            {{ t('expenses.total') }}
          </div>
          <div class="text-4xl font-heading font-semibold text-green-600 tabular-nums">
            {{ formatCurrency(totalExpenses) }}
          </div>
          <div
            v-if="percentageChange"
            :class="[
              'text-xs font-medium mt-1',
              percentageChange > 0 ? 'text-red-600' : 'text-green-600',
            ]"
          >
            {{ percentageChange > 0 ? '+' : '' }}{{ percentageChange }}% vs
            {{ t('expenses.periods.lastMonth') }}
          </div>
        </div>

        <!-- Expense Categories -->
        <div>
          <div class="text-sm font-heading font-semibold text-gray-900 mb-3">
            {{ t('expenses.breakdown') }}
          </div>
          <div class="grid gap-3">
            <div
              v-for="(amount, category) in expensesByCategory"
              :key="category"
              :class="[
                'flex items-center gap-3 p-3 rounded-lg border',
                categoryConfig[category]?.bgColor,
                categoryConfig[category]?.borderColor,
              ]"
            >
              <div
                :class="[
                  'p-2 rounded-lg',
                  categoryConfig[category]?.bgColor,
                  categoryConfig[category]?.borderColor,
                ]"
              >
                <component
                  :is="categoryConfig[category]?.icon"
                  class="w-5 h-5"
                  :class="categoryConfig[category]?.color"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <div class="text-sm font-medium text-gray-900">
                    {{ t(`expenses.categories.${category}`) }}
                  </div>
                  <div class="text-sm font-medium tabular-nums">
                    {{ formatCurrency(amount) }}
                  </div>
                </div>
                <div class="text-xs text-gray-500">
                  {{ Math.round((amount / totalExpenses) * 100) || 0 }}%
                  {{ t('deliveries.stats.fromTotal') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
