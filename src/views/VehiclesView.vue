<template>
    <div>
      <h1 class="text-2xl font-bold mb-6">{{ t('vehicles.title') }}</h1>
      <div class="bg-white rounded-lg shadow p-6">
        <p>{{ t('vehicles.search') }}</p>
        <div class="mt-4">
          <h4 class="text-sm font-medium mb-2">{{ t('vehicles.breakdown') }}</h4>
          <div class="space-y-3">
            <div v-for="vehicle in vehicles" :key="vehicle.type" class="space-y-1">
              <div class="flex justify-between text-sm">
                <span>{{ t(vehicle.type) }}</span>
                <span>{{ t(vehicle.status === 'Active' ? 'vehicles.status.active' : 'vehicles.status.maintenance') }}</span>
              </div>
              <div class="h-2 bg-gray-100 rounded-full">
                <div class="h-full bg-green-500 rounded-full"
                     :style="{ width: `${vehicle.fuel}%` }" />
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

const vehicles = [
  {
    type: 'Delivery Truck',
    status: 'Active',
    fuel: 75
  },
  {
    type: 'Van',
    status: 'Maintenance',
    fuel: 45
  },
  {
    type: 'Pickup',
    status: 'Active',
    fuel: 90
  }
]
</script>
