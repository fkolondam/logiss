<template>
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b">
        <div class="flex items-center gap-2">
          <Car class="w-5 h-5 text-purple-500" />
          <h2 class="text-lg font-semibold">{{ t('vehicles.title') }}</h2>
        </div>
      </div>
      <div class="p-4">
        <div v-for="vehicle in vehicles" 
             :key="vehicle.type" 
             class="mb-6 last:mb-0 pb-6 last:pb-0 border-b last:border-0">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-semibold">{{ vehicle.type }}</h3>
            <span :class="[ 
              'px-2 py-1 rounded-full text-xs', 
              vehicle.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800' 
            ]">
              {{ t(vehicle.status === 'Active' ? 'vehicles.status.active' : 'vehicles.status.maintenance') }}
            </span>
          </div>
          <p class="text-sm text-gray-500 mb-3">{{ vehicle.driver }}</p>
          <div class="space-y-1">
            <div class="flex justify-between text-sm">
              <span>{{ t('vehicles.fuel') }}</span>
              <span>{{ vehicle.fuel }}%</span>
            </div>
            <div class="h-2 bg-gray-100 rounded-full">
              <div class="h-full bg-green-500 rounded-full"
                   :style="{ width: `${vehicle.fuel}%` }" />
            </div>
          </div>
          <p class="text-xs text-gray-400 mt-2">{{ vehicle.location }}</p>
        </div>
      </div>
    </div>
</template>

<script setup>
import { Car } from 'lucide-vue-next'
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()

const vehicles = [
  {
    type: 'Delivery Truck',
    driver: 'Tom Wilson',
    status: 'Active',
    fuel: 75,
    location: 'Route 66'
  },
  {
    type: 'Van',
    driver: 'Jerry Smith',
    status: 'Maintenance',
    fuel: 45,
    location: 'Service Center'
  },
  {
    type: 'Pickup',
    driver: 'Alice Brown',
    status: 'Active',
    fuel: 90,
    location: 'Downtown'
  }
]
</script>
