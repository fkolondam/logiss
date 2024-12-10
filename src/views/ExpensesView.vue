<template>
    <div>
      <h1 class="text-2xl font-bold mb-6">{{ t('expenses.title') }}</h1>
      <div class="bg-white rounded-lg shadow p-4">
        <p>{{ t('expenses.search') }}</p>
        <div class="mt-4">
          <h4 class="text-sm font-medium mb-2">{{ t('expenses.breakdown') }}</h4>
          <div class="space-y-3">
            <div v-for="item in breakdown" :key="item.label" class="space-y-1">
              <div class="flex justify-between text-sm">
                <span>{{ t(item.label) }}</span>
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
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()

const breakdown = [
  { label: 'Fuel', percentage: 49 },
  { label: 'Maintenance', percentage: 33 },
  { label: 'Insurance', percentage: 12 },
  { label: 'Others', percentage: 6 }
]
</script>
