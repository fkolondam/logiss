<script>
import { computed } from 'vue'
import { 
  Truck, 
  AlertCircle, 
  MapPin, 
  User, 
  Fuel as FuelIcon,
  AlertTriangle,
  ArrowRight
} from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'
import { useRouter } from 'vue-router'

export default {
  name: 'VehicleStatus',
  components: {
    Truck,
    AlertCircle,
    MapPin,
    User,
    FuelIcon,
    AlertTriangle,
    ArrowRight
  },
  props: {
    vehicles: {
      type: Array,
      default: () => []
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
    const router = useRouter()

    const getStatusColor = (status) => {
      const statusMap = {
        active: {
          bg: 'bg-green-100',
          text: 'text-green-800',
          dot: 'bg-green-500'
        },
        maintenance: {
          bg: 'bg-orange-100',
          text: 'text-orange-800',
          dot: 'bg-orange-500'
        },
        inactive: {
          bg: 'bg-red-100',
          text: 'text-red-800',
          dot: 'bg-red-500'
        }
      }
      return statusMap[status] || statusMap.inactive
    }

    const getFuelLevelColor = (level) => {
      if (level > 70) return 'bg-green-600'
      if (level > 30) return 'bg-yellow-600'
      return 'bg-red-600'
    }

    const vehicleStats = computed(() => {
      const total = props.vehicles.length
      const active = props.vehicles.filter(v => v.status === 'active').length
      const maintenance = props.vehicles.filter(v => v.status === 'maintenance').length
      const lowFuel = props.vehicles.filter(v => v.fuelLevel < 30).length

      return { total, active, maintenance, lowFuel }
    })

    const navigateToVehicle = (vehicleId) => {
      router.push({
        name: 'vehicles',
        params: { id: vehicleId }
      })
    }

    return {
      t,
      getStatusColor,
      getFuelLevelColor,
      vehicleStats,
      navigateToVehicle
    }
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow">
    <div class="p-2.5 border-b">
      <div class="flex items-center gap-2">
        <Truck class="w-4 h-4 text-purple-500" />
        <h2 class="text-sm font-heading font-semibold tracking-tight">{{ t('vehicles.title') }}</h2>
      </div>
    </div>

    <div class="p-2.5">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-2.5">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center gap-2 text-red-600 py-2.5">
        <AlertCircle class="w-4 h-4" />
        <span class="text-xs">{{ error }}</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!vehicles.length" class="text-xs text-gray-500 text-center py-2.5">
        {{ t('vehicles.noVehicles') }}
      </div>

      <div v-else class="space-y-3">
        <!-- Stats Overview -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <!-- Total Vehicles -->
          <div class="bg-purple-50 rounded-lg p-2">
            <div class="h-[90px] flex flex-col">
              <div class="h-6 flex items-center">
                <div class="text-[10px] text-gray-600 uppercase tracking-wider leading-none">{{ t('vehicles.stats.total') }}</div>
              </div>
              <div class="flex-1 flex items-center">
                <div class="text-3xl font-heading font-semibold text-purple-600 tabular-nums leading-none">
                  {{ vehicleStats.total }}
                </div>
              </div>
              <div class="h-6 flex items-center justify-end">
                <button 
                  @click="navigateToVehicle()"
                  class="flex items-center gap-0.5 text-[10px] font-medium text-purple-700 hover:text-purple-800 transition-colors"
                >
                  <span>{{ t('common.viewAll') }}</span>
                  <ArrowRight class="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Active Vehicles -->
          <div class="bg-green-50 rounded-lg p-2">
            <div class="h-[90px] flex flex-col">
              <div class="h-6 flex items-center">
                <div class="text-[10px] text-gray-600 uppercase tracking-wider leading-none">{{ t('vehicles.stats.active') }}</div>
              </div>
              <div class="flex-1 flex items-center">
                <div class="text-3xl font-heading font-semibold text-green-600 tabular-nums leading-none">
                  {{ vehicleStats.active }}
                </div>
              </div>
              <div class="h-6 flex items-center justify-end">
                <button 
                  @click="navigateToVehicle()"
                  class="flex items-center gap-0.5 text-[10px] font-medium text-green-700 hover:text-green-800 transition-colors"
                >
                  <span>{{ t('common.details') }}</span>
                  <ArrowRight class="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Maintenance -->
          <div class="bg-orange-50 rounded-lg p-2">
            <div class="h-[90px] flex flex-col">
              <div class="h-6 flex items-center">
                <div class="text-[10px] text-gray-600 uppercase tracking-wider leading-none">{{ t('vehicles.stats.maintenance') }}</div>
              </div>
              <div class="flex-1 flex items-center">
                <div class="text-3xl font-heading font-semibold text-orange-600 tabular-nums leading-none">
                  {{ vehicleStats.maintenance }}
                </div>
              </div>
              <div class="h-6 flex items-center justify-end">
                <button 
                  @click="navigateToVehicle()"
                  class="flex items-center gap-0.5 text-[10px] font-medium text-orange-700 hover:text-orange-800 transition-colors"
                >
                  <span>{{ t('common.details') }}</span>
                  <ArrowRight class="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Low Fuel -->
          <div class="bg-red-50 rounded-lg p-2">
            <div class="h-[90px] flex flex-col">
              <div class="h-6 flex items-center">
                <div class="text-[10px] text-gray-600 uppercase tracking-wider leading-none">{{ t('vehicles.stats.lowFuel') }}</div>
              </div>
              <div class="flex-1 flex items-center">
                <div class="text-3xl font-heading font-semibold text-red-600 tabular-nums leading-none">
                  {{ vehicleStats.lowFuel }}
                </div>
              </div>
              <div class="h-6 flex items-center justify-end">
                <button 
                  @click="navigateToVehicle()"
                  class="flex items-center gap-0.5 text-[10px] font-medium text-red-700 hover:text-red-800 transition-colors"
                >
                  <span>{{ t('common.details') }}</span>
                  <ArrowRight class="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Vehicle List -->
        <div class="space-y-2">
          <div 
            v-for="vehicle in vehicles" 
            :key="vehicle.id"
            class="flex flex-col p-2 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg cursor-pointer"
            @click="navigateToVehicle(vehicle.id)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <h3 class="text-xs font-heading font-semibold text-gray-900 truncate">{{ vehicle.plateNumber }}</h3>
                <div class="mt-0.5 flex flex-wrap gap-2">
                  <!-- Driver Info -->
                  <div class="flex items-center gap-1">
                    <User class="w-3 h-3 text-gray-500" />
                    <span class="text-[10px] font-medium text-gray-700">{{ vehicle.assignedDriver?.name }}</span>
                  </div>
                  <!-- Location -->
                  <div class="flex items-center gap-1">
                    <MapPin class="w-3 h-3 text-gray-500" />
                    <span class="text-[10px] font-medium text-gray-700">{{ vehicle.currentLocation?.address }}</span>
                  </div>
                </div>
              </div>

              <!-- Status Badge -->
              <span 
                :class="[
                  'inline-block px-1.5 py-0.5 text-[10px] font-medium rounded-full',
                  getStatusColor(vehicle.status).bg,
                  getStatusColor(vehicle.status).text
                ]"
              >
                {{ t(`vehicles.status.${vehicle.status}`) }}
              </span>
            </div>

            <!-- Fuel Level -->
            <div class="flex items-center gap-1.5 mt-1">
              <FuelIcon class="w-3 h-3 text-gray-500" />
              <div class="flex-1">
                <div class="flex items-center justify-between mb-0.5">
                  <span class="text-[10px] font-medium text-gray-600">{{ t('vehicles.fuel') }}</span>
                  <span class="text-[10px] font-medium text-gray-600 tabular-nums">{{ vehicle.fuelEfficiency }}</span>
                </div>
                <div class="bg-gray-200 rounded-full h-1">
                  <div 
                    class="h-1 rounded-full transition-all duration-300" 
                    :class="getFuelLevelColor(vehicle.fuelLevel)"
                    :style="{ width: vehicle.fuelLevel + '%' }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Additional Info -->
            <div class="flex items-center justify-between mt-1">
              <div class="flex items-center gap-1.5">
                <!-- Maintenance Status -->
                <div v-if="vehicle.status === 'maintenance'" class="flex items-center gap-1 text-orange-600">
                  <AlertTriangle class="w-3 h-3" />
                  <span class="text-[10px] font-medium">{{ t('vehicles.nextService') }}: {{ vehicle.nextServiceDue }}</span>
                </div>
              </div>
              
              <!-- View Details -->
              <button 
                class="flex items-center gap-0.5 text-[10px] font-medium text-purple-700 hover:text-purple-800 transition-colors"
                @click.stop="navigateToVehicle(vehicle.id)"
              >
                <span>{{ t('common.viewDetails') }}</span>
                <ArrowRight class="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
