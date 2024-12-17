<script>
import { ref, computed } from 'vue'
import { Receipt, Fuel, Wrench, Shield, MoreHorizontal, AlertCircle, Calendar, TrendingUp, TrendingDown, ArrowRight } from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'

export default {
  name: 'ExpensesOverview',
  components: {
    Receipt,
    Fuel,
    Wrench,
    Shield,
    MoreHorizontal,
    AlertCircle,
    Calendar,
    TrendingUp,
    TrendingDown,
    ArrowRight
  },
  props: {
    expenses: {
      type: Object,
      default: () => ({
        today: 0,
        weekly: 0,
        monthly: 0,
        breakdown: {
          fuel: { amount: 0 },
          maintenance: { amount: 0 },
          insurance: { amount: 0 },
          others: { amount: 0 }
        }
      })
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const { t } = useTranslations()
    const selectedPeriod = ref('today')
    
    const formatCurrency = (value) => {
      if (!value) return '0'
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    }

    const periods = [
      { id: 'today', label: t('expenses.periods.Today'), value: props.expenses?.today },
      { id: 'week', label: t('expenses.periods.ThisWeek'), value: props.expenses?.weekly },
      { id: 'month', label: t('expenses.periods.ThisMonth'), value: props.expenses?.monthly }
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
      const periodMap = {
        today: props.expenses?.today || 0,
        week: props.expenses?.weekly || 0,
        month: props.expenses?.monthly || 0
      }
      return periodMap[selectedPeriod.value] || 0
    })

    const getBreakdownData = computed(() => {
      const breakdown = {
        fuel: { amount: 0, percentage: 0 },
        maintenance: { amount: 0, percentage: 0 },
        insurance: { amount: 0, percentage: 0 },
        others: { amount: 0, percentage: 0 }
      }

      if (!props.expenses?.breakdown || !selectedPeriodData.value) {
        return breakdown
      }

      // Calculate total amount from breakdown
      const totalFromBreakdown = Object.values(props.expenses.breakdown)
        .reduce((sum, category) => sum + (category?.amount || 0), 0)

      // Calculate percentages for each category
      Object.keys(breakdown).forEach(category => {
        const amount = props.expenses.breakdown[category]?.amount || 0
        breakdown[category] = {
          amount,
          percentage: totalFromBreakdown > 0 ? Math.round((amount / totalFromBreakdown) * 100) : 0
        }
      })

      return breakdown
    })
    
    return {
      t,
      formatCurrency,
      selectedPeriod,
      periods,
      getTrendIndicator,
      selectedPeriodData,
      getBreakdownData
    }
  }
}
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
              <div 
                v-if="selectedPeriod !== 'today'"
                :class="['flex items-center gap-1 text-sm mb-1', getTrendIndicator(selectedPeriodData, expenses?.previousPeriod?.[selectedPeriod]).color]"
              >
                <component :is="getTrendIndicator(selectedPeriodData, expenses?.previousPeriod?.[selectedPeriod]).icon" class="w-4 h-4" />
                <span>{{ getTrendIndicator(selectedPeriodData, expenses?.previousPeriod?.[selectedPeriod]).trend }}%</span>
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
