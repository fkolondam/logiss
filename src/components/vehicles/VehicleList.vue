<template>
  <div class="space-y-3">
    <div
      v-for="vehicle in vehicles"
      :key="vehicle.id"
      class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
    >
      <!-- Status Indicator -->
      <div
        class="w-2 h-2 rounded-full"
        :class="vehicle.status === 'active' ? 'bg-green-500' : 'bg-red-500'"
      ></div>

      <!-- Vehicle Info -->
      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-sm font-medium text-gray-900">{{ vehicle.plateNumber }}</div>
            <div class="text-xs text-gray-500">{{ vehicle.type }}</div>
          </div>
          <div
            class="text-xs font-medium px-2 py-1 rounded-full"
            :class="getStatusClass(vehicle.status)"
          >
            {{ t(`vehicles.status.${vehicle.status}`) }}
          </div>
        </div>

        <!-- Progress Bars -->
        <div class="mt-2 space-y-2">
          <!-- Fuel Level -->
          <div class="flex items-center gap-2">
            <Fuel class="w-4 h-4 text-gray-400" />
            <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-blue-500 transition-all duration-500"
                :style="{ width: `${vehicle.fuelLevel || 0}%` }"
              ></div>
            </div>
            <span class="text-xs text-gray-600">{{ vehicle.fuelLevel }}%</span>
          </div>

          <!-- Maintenance Level -->
          <div class="flex items-center gap-2">
            <Wrench class="w-4 h-4 text-gray-400" />
            <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full transition-all duration-500"
                :class="getMaintenanceBarClass(vehicle.maintenanceLevel)"
                :style="{ width: `${vehicle.maintenanceLevel || 0}%` }"
              ></div>
            </div>
            <span class="text-xs text-gray-600">{{ vehicle.maintenanceLevel }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Fuel, Wrench } from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'

const { t } = useTranslations()

const props = defineProps({
  vehicles: {
    type: Array,
    default: () => [],
  },
})

const getStatusClass = (status) => {
  switch (status) {
    case 'active':
      return 'bg-green-50 text-green-700'
    case 'maintenance':
      return 'bg-red-50 text-red-700'
    default:
      return 'bg-gray-50 text-gray-700'
  }
}

const getMaintenanceBarClass = (level) => {
  if (level >= 70) return 'bg-green-500'
  if (level >= 30) return 'bg-orange-500'
  return 'bg-red-500'
}
</script>
