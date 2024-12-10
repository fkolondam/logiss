<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
      <div v-for="stat in stats" :key="stat.title" 
           class="bg-white rounded-lg p-4 shadow">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-xl sm:text-2xl font-bold mb-1">{{ stat.value }}</h3>
            <p class="text-sm text-gray-500">{{ t(stat.translationKey) }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ t(stat.subtitleKey) }}</p>
          </div>
          <div :class="`rounded-full p-2 bg-opacity-10 ${stat.iconBg}`">
            <component :is="stat.icon" 
                      class="w-8 h-8"
                      :class="stat.iconColor" />
          </div>
        </div>
      </div>
    </div>
</template>
  
<script setup>
import { Package, Truck, Activity } from 'lucide-vue-next'
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()

const stats = [
  {
    translationKey: 'stats.todayDeliveries',
    value: "3",
    subtitleKey: 'stats.completionRate',
    icon: Package,
    iconBg: 'bg-blue-500',
    iconColor: 'text-blue-500'
  },
  {
    translationKey: 'stats.thisWeek',
    value: "45",
    subtitleKey: 'stats.fromLastWeek',
    icon: Truck,
    iconBg: 'bg-green-500',
    iconColor: 'text-green-500'
  },
  {
    translationKey: 'stats.thisMonth',
    value: "189",
    subtitleKey: 'stats.monthlyTarget',
    icon: Activity,
    iconBg: 'bg-purple-500',
    iconColor: 'text-purple-500'
  }
]
</script>
