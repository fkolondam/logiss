<script setup>
import { computed } from 'vue'
import { Receipt, Fuel, Wrench, Shield, MoreHorizontal, AlertCircle, Calendar, TrendingUp, TrendingDown, ArrowRight } from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'

const props = defineProps({
  expenses: {
    type: Object,
    default: () => ({
      total: 0,
      count: 0,
      byCategory: {}
    })
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  modelValue: {
    type: String,
    default: 'today'
  }
})

const emit = defineEmits(['update:modelValue'])
const { t } = useTranslations()
    

const selectedPeriod = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formatCurrency = (value) => {
  if (!value) return '0'
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

// Since we're getting total stats for the selected period directly,
// we don't need values in the period selector
const periods = [
  { id: 'today', label: t('expenses.periods.Today') },
  { id: 'week', label: t('expenses.periods.ThisWeek') },
  { id: 'month', label: t('expenses.periods.ThisMonth') }
]

const getTrendIndicator = (current, previous) => {
  if (!current || !previous) return { trend: 0, color: 'text-gray-500' }
  const trend = ((current - previous) / previous) * 100
  return {
    trend: Math.abs(Math.round(trend)),
    color: trend > 0 ? 'text-red-500' : 'text-green-500',
    icon: trend > 0 ? TrendingUp : TrendingDown
  }
}

const selectedPeriodData = computed(() => {
  return props.expenses?.total || 0
})

const getBreakdownData = computed(() => {
  const breakdown = {
    fuel: { amount: 0, percentage: 0 },
    maintenance: { amount: 0, percentage: 0 },
    insurance: { amount: 0, percentage: 0 },
    others: { amount: 0, percentage: 0 }
  }

  if (!props.expenses?.byCategory) {
    return breakdown
  }

  // Map expense categories to our breakdown structure
  const categoryMap = {
    'Fuel': 'fuel',
    'Maintenance': 'maintenance',
    'Vehicle License': 'insurance',
    'Labour': 'others',
    'Parking-Tol-Retribution': 'others'
  }

  // Calculate total amount
  const totalFromBreakdown = Object.values(props.expenses.byCategory)
    .reduce((sum, amount) => sum + (amount || 0), 0)

  // Calculate amounts and percentages for each category
  Object.entries(props.expenses.byCategory).forEach(([category, amount]) => {
    const mappedCategory = categoryMap[category] || 'others'
    breakdown[mappedCategory].amount += amount
  })

  // Calculate percentages
  Object.keys(breakdown).forEach(category => {
    breakdown[category].percentage = totalFromBreakdown > 0 
      ? Math.round((breakdown[category].amount / totalFromBreakdown) * 100) 
      : 0
  })

  return breakdown
})
</script>

<template>
  <div class="bg-white rounded-lg shadow">
    <div class="p-4 border-b">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Receipt class="w-5 h-5 text-green-500" />
          <h2 class="text-base font-heading font-semibold tracking-tight">{{ t('expenses.title') }}</h2>
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

      <div v-else class="space-y-2">
        <!-- Period Selector -->
        <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <Calendar class="w-4 h-4 text-gray-500" />
          <div class="flex gap-2 flex-1">
            <button
              v-for="period in periods"
              :key="period.id"
              @click="selectedPeriod = period.id"
              :class="[
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                selectedPeriod === period.id
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:bg-white/50'
              ]"
            >
              {{ period.label }}
            </button>
          </div>
        </div>

        <!-- Selected Period Overview -->
        <div class="bg-green-50 rounded-lg p-4">
          <div class="flex flex-col">
            <div class="text-sm text-gray-500 uppercase tracking-wide mb-6">{{ t('expenses.total') }}</div>
            <div class="flex items-end gap-2">
              <div class="text-3xl font-heading font-semibold text-gray-900 tabular-nums leading-none">
                Rp {{ formatCurrency(selectedPeriodData) }}
              </div>
              <!-- Only show trend for week and month periods -->
              <div 
                v-if="selectedPeriod !== 'today'"
                :class="['flex items-center gap-1 text-sm mb-1', getTrendIndicator(selectedPeriodData, expenses?.previousTotal).color]"
              >
                <component :is="getTrendIndicator(selectedPeriodData, expenses?.previousTotal).icon" class="w-4 h-4" />
                <span>{{ getTrendIndicator(selectedPeriodData, expenses?.previousTotal).trend }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Expenses Breakdown -->
        <div class="space-y-1">
          <div class="flex items-center justify-between mt-5">
            <div class="text-sm font-heading font-semibold text-gray-900">{{ t('expenses.breakdown') }}</div>
            <div class="text-xs text-gray-500">{{ t('expenses.total') }}: Rp {{ formatCurrency(selectedPeriodData) }}</div>
          </div>
          
          <!-- Fuel -->
          <div class="flex items-center gap-3 p-1 hover:bg-gray-50 rounded-lg transition-colors">
            <div class="p-2 rounded-lg bg-green-100">
              <Fuel class="w-4 h-4 text-green-600" />
            </div>
            <div class="flex-1">
              <div class="flex flex-col mb-2">
                <span class="text-xs font-medium text-gray-900">{{ t('expenses.categories.fuel') }}</span>
                <div class="flex items-center justify-between">
                  <span class="text-normal font-semibold text-gray-900 tabular-nums">Rp {{ formatCurrency(getBreakdownData.fuel.amount) }}</span>
                  <span class="text-xs text-gray-500 tabular-nums">{{ getBreakdownData.fuel.percentage }}%</span>
                </div>
              </div>
              <div class="mt-1 bg-gray-200 rounded-full h-1.5">
                <div 
                  class="bg-green-600 h-1.5 rounded-full transition-all duration-300" 
                  :style="{ width: getBreakdownData.fuel.percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Maintenance -->
          <div class="flex items-center gap-3 p-1 hover:bg-gray-50 rounded-lg transition-colors">
            <div class="p-2 rounded-lg bg-blue-100">
              <Wrench class="w-4 h-4 text-blue-600" />
            </div>
            <div class="flex-1">
              <div class="flex flex-col mb-2">
                <span class="text-xs font-medium text-gray-900">{{ t('expenses.categories.maintenance') }}</span>
                <div class="flex items-center justify-between">
                  <span class="text-normal font-semibold text-gray-900 tabular-nums">Rp {{ formatCurrency(getBreakdownData.maintenance.amount) }}</span>
                  <span class="text-xs text-gray-500 tabular-nums">{{ getBreakdownData.maintenance.percentage }}%</span>
                </div>
              </div>
              <div class="mt-1 bg-gray-200 rounded-full h-1.5">
                <div 
                  class="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                  :style="{ width: getBreakdownData.maintenance.percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Insurance -->
          <div class="flex items-center gap-3 p-1 hover:bg-gray-50 rounded-lg transition-colors">
            <div class="p-2 rounded-lg bg-purple-100">
              <Shield class="w-4 h-4 text-purple-600" />
            </div>
            <div class="flex-1">
              <div class="flex flex-col mb-2">
                <span class="text-xs font-medium text-gray-900">{{ t('expenses.categories.insurance') }}</span>
                <div class="flex items-center justify-between">
                  <span class="text-normal font-semibold text-gray-900 tabular-nums">Rp {{ formatCurrency(getBreakdownData.insurance.amount) }}</span>
                  <span class="text-xs text-gray-500 tabular-nums">{{ getBreakdownData.insurance.percentage }}%</span>
                </div>
              </div>
              <div class="mt-1 bg-gray-200 rounded-full h-1.5">
                <div 
                  class="bg-purple-600 h-1.5 rounded-full transition-all duration-300" 
                  :style="{ width: getBreakdownData.insurance.percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Others -->
          <div class="flex items-center gap-3 p-1 hover:bg-gray-50 rounded-lg transition-colors">
            <div class="p-2 rounded-lg bg-gray-100">
              <MoreHorizontal class="w-4 h-4 text-gray-600" />
            </div>
            <div class="flex-1">
              <div class="flex flex-col mb-2">
                <span class="text-xs font-medium text-gray-900">{{ t('expenses.categories.others') }}</span>
                <div class="flex items-center justify-between">
                  <span class="text-normal font-semibold text-gray-900 tabular-nums">Rp {{ formatCurrency(getBreakdownData.others.amount) }}</span>
                  <span class="text-xs text-gray-500 tabular-nums">{{ getBreakdownData.others.percentage }}%</span>
                </div>
              </div>
              <div class="mt-1 bg-gray-200 rounded-full h-1.5">
                <div 
                  class="bg-gray-600 h-1.5 rounded-full transition-all duration-300" 
                  :style="{ width: getBreakdownData.others.percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
