<script>
import { Truck } from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'

export default {
  name: 'VehicleStatus',
  components: {
    Truck
  },
  props: {
    vehicles: Array,
    loading: Boolean
  },
  setup() {
    const { t } = useTranslations()
    
    return {
      t
    }
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow">
    <div class="p-4 border-b">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Truck class="w-5 h-5 text-purple-500" />
          <h2 class="text-lg font-heading font-semibold tracking-tight">{{ t('vehicles.title') }}</h2>
        </div>
      </div>
    </div>

    <div class="p-4">
      <div v-if="loading" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
      <div v-else class="space-y-6">
        <!-- Vehicle List -->
        <div class="space-y-4">
          <!-- Delivery Truck -->
          <div class="p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-heading font-semibold text-gray-900">{{ t('vehicles.types.deliveryTruck') }}</h3>
                <p class="text-sm font-medium text-gray-700 mt-1">Tom Wilson</p>
                <p class="text-sm text-gray-500 flex items-center gap-1">
                  <span class="inline-block w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  Route 66
                </p>
              </div>
              <div class="text-right">
                <span class="inline-block px-2 py-1 text-sm rounded-full bg-green-100 text-green-800">{{ t('vehicles.status.active') }}</span>
                <div class="mt-2">
                  <div class="text-sm text-gray-600">{{ t('vehicles.fuel') }}</div>
                  <div class="flex items-center gap-2">
                    <div class="flex-1 bg-gray-200 rounded-full h-2">
                      <div class="bg-green-600 h-2 rounded-full" style="width: 75%"></div>
                    </div>
                    <span class="text-sm text-gray-600">75%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Van -->
          <div class="p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-heading font-semibold text-gray-900">{{ t('vehicles.types.van') }}</h3>
                <p class="text-sm font-medium text-gray-700 mt-1">Jerry Smith</p>
                <p class="text-sm text-gray-500 flex items-center gap-1">
                  <span class="inline-block w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  Service Center
                </p>
              </div>
              <div class="text-right">
                <span class="inline-block px-2 py-1 text-sm rounded-full bg-orange-100 text-orange-800">{{ t('vehicles.status.maintenance') }}</span>
                <div class="mt-2">
                  <div class="text-sm text-gray-600">{{ t('vehicles.fuel') }}</div>
                  <div class="flex items-center gap-2">
                    <div class="flex-1 bg-gray-200 rounded-full h-2">
                      <div class="bg-green-600 h-2 rounded-full" style="width: 45%"></div>
                    </div>
                    <span class="text-sm text-gray-600">45%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pickup -->
          <div class="p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-heading font-semibold text-gray-900">{{ t('vehicles.types.pickup') }}</h3>
                <p class="text-sm font-medium text-gray-700 mt-1">Alice Brown</p>
                <p class="text-sm text-gray-500 flex items-center gap-1">
                  <span class="inline-block w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                  Downtown
                </p>
              </div>
              <div class="text-right">
                <span class="inline-block px-2 py-1 text-sm rounded-full bg-green-100 text-green-800">{{ t('vehicles.status.active') }}</span>
                <div class="mt-2">
                  <div class="text-sm text-gray-600">{{ t('vehicles.fuel') }}</div>
                  <div class="flex items-center gap-2">
                    <div class="flex-1 bg-gray-200 rounded-full h-2">
                      <div class="bg-green-600 h-2 rounded-full" style="width: 90%"></div>
                    </div>
                    <span class="text-sm text-gray-600">90%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
