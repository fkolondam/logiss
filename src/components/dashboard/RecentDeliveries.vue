<template>
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b">
        <div class="flex items-center gap-2">
          <Truck class="w-5 h-5 text-blue-500" />
          <h2 class="text-lg font-semibold">{{ t('dashboard.recentDeliveries') }}</h2>
        </div>
      </div>
      <div class="p-4">
        <div v-for="delivery in deliveries" 
             :key="delivery.id" 
             class="mb-4 last:mb-0 pb-4 last:pb-0 border-b last:border-0">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-semibold">{{ delivery.customer }}</h3>
              <p class="text-sm text-gray-500">{{ delivery.location }}</p>
              <p class="text-xs text-gray-400">{{ delivery.time }}</p>
            </div>
            <span :class="[ 
              'px-3 py-1 rounded-full text-xs', 
              delivery.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800' 
            ]">
              {{ t(delivery.status === 'Delivered' ? 'deliveries.status.delivered' : 'deliveries.status.partiallyDelivered') }}
            </span>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { Truck } from 'lucide-vue-next'
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()

const deliveries = [
  {
    id: 1,
    customer: 'PARJO',
    location: 'PS LAP BOLA',
    time: '11:28',
    status: 'Delivered'
  },
  {
    id: 2,
    customer: 'MASIDIK',
    location: 'JL SAMOLO CIHIDEUNG',
    time: '11:29',
    status: 'Delivered'
  },
  {
    id: 3,
    customer: 'GAFAMART',
    location: 'TAMAN KARYA',
    time: '11:22',
    status: 'Partially Delivered'
  }
]
</script>
