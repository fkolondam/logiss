<script>
import { Receipt, Fuel, Wrench, Shield, MoreHorizontal } from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'

export default {
  name: 'ExpensesOverview',
  components: {
    Receipt,
    Fuel,
    Wrench,
    Shield,
    MoreHorizontal
  },
  props: {
    expenses: Object,
    loading: Boolean
  },
  setup() {
    const { t } = useTranslations()
    
    const formatCurrency = (value) => {
      if (!value) return '0'
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    }
    
    return {
      t,
      formatCurrency
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
      <div v-if="loading" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
      <div v-else class="space-y-6">
        <!-- Period Metrics -->
        <div class="grid grid-cols-3 gap-4 mt-1">
          <div class="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div class="text-2xs text-gray-500 uppercase tracking-wide mb-1">{{ t('expenses.periods.ThisMonth') }}</div>
            <div class="text-lg font-heading font-semibold">Rp {{ formatCurrency(expenses?.monthly) }}</div>
          </div>
          <div class="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div class="text-2xs text-gray-500 uppercase tracking-wide mb-1">{{ t('expenses.periods.ThisWeek') }}</div>
            <div class="text-lg font-heading font-semibold">Rp {{ formatCurrency(expenses?.weekly) }}</div>
          </div>
          <div class="p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors border-l-4 border-green-500">
            <div class="text-2xs text-gray-500 uppercase tracking-wide mb-1">{{ t('expenses.periods.Today') }}</div>
            <div class="text-lg font-heading font-semibold">Rp {{ formatCurrency(expenses?.today) }}</div>
          </div>
        </div>

        <!-- Expenses Breakdown -->
        <div class="space-y-3">
          <div class="text-sm font-heading font-semibold text-gray-900">{{ t('expenses.breakdown') }}</div>
          
          <!-- Fuel -->
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-green-100">
              <Fuel class="w-5 h-5 text-green-600" />
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-900">{{ t('expenses.categories.fuel') }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600">Rp {{ formatCurrency(expenses?.breakdown?.fuel?.amount) }}</span>
                  <span class="text-xs text-gray-500">{{ expenses?.breakdown?.fuel?.percentage }}%</span>
                </div>
              </div>
              <div class="mt-1 bg-gray-200 rounded-full h-2">
                <div class="bg-green-600 h-2 rounded-full" :style="{ width: expenses?.breakdown?.fuel?.percentage + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- Maintenance -->
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-blue-100">
              <Wrench class="w-5 h-5 text-blue-600" />
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-900">{{ t('expenses.categories.maintenance') }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600">Rp {{ formatCurrency(expenses?.breakdown?.maintenance?.amount) }}</span>
                  <span class="text-xs text-gray-500">{{ expenses?.breakdown?.maintenance?.percentage }}%</span>
                </div>
              </div>
              <div class="mt-1 bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full" :style="{ width: expenses?.breakdown?.maintenance?.percentage + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- Insurance -->
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-purple-100">
              <Shield class="w-5 h-5 text-purple-600" />
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-900">{{ t('expenses.categories.insurance') }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600">Rp {{ formatCurrency(expenses?.breakdown?.insurance?.amount) }}</span>
                  <span class="text-xs text-gray-500">{{ expenses?.breakdown?.insurance?.percentage }}%</span>
                </div>
              </div>
              <div class="mt-1 bg-gray-200 rounded-full h-2">
                <div class="bg-purple-600 h-2 rounded-full" :style="{ width: expenses?.breakdown?.insurance?.percentage + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- Others -->
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-gray-100">
              <MoreHorizontal class="w-5 h-5 text-gray-600" />
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-900">{{ t('expenses.categories.others') }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600">Rp {{ formatCurrency(expenses?.breakdown?.others?.amount) }}</span>
                  <span class="text-xs text-gray-500">{{ expenses?.breakdown?.others?.percentage }}%</span>
                </div>
              </div>
              <div class="mt-1 bg-gray-200 rounded-full h-2">
                <div class="bg-gray-600 h-2 rounded-full" :style="{ width: expenses?.breakdown?.others?.percentage + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
