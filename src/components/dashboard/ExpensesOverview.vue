<template>
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b">
        <div class="flex items-center gap-2">
          <FileText class="w-5 h-5 text-green-500" />
          <h2 class="text-lg font-semibold">{{ t('expenses.title') }}</h2>
        </div>
      </div>
      <div class="p-4">
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div v-for="(amount, period) in expenses" :key="period">
            <p class="text-sm text-gray-500">{{ t(`expenses.periods.${period}`) }}</p>
            <p class="text-lg font-semibold">${{ formatNumber(amount) }}</p>
          </div>
        </div>
        <div>
          <h4 class="text-sm font-medium mb-2">{{ t('expenses.breakdown') }}</h4>
          <div class="space-y-3">
            <div v-for="item in breakdown" :key="item.label" class="space-y-1">
              <div class="flex justify-between text-sm">
                <span>{{ item.label }}</span>
                <span>{{ item.percentage }}%</span>
              </div>
              <div class="h-2 bg-gray-100 rounded-full">
                <div class="h-full bg-green-500 rounded-full"
                     :style="{ width: `${item.percentage}%` }" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { FileText } from 'lucide-vue-next'
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()

const expenses = {
  Monthly: 24500,
  Weekly: 6200,
  Today: 950
}

const breakdown = [
  { label: 'Fuel', percentage: 49 },
  { label: 'Maintenance', percentage: 33 },
  { label: 'Insurance', percentage: 12 },
  { label: 'Others', percentage: 6 }
]

const formatNumber = (value) => {
  return value.toLocaleString()
}
</script>
