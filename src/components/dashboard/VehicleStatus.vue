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
    <div class="p-4 border-b">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Truck class="w-5 h-5 text-purple-500" />
          <h2 class="text-base font-heading font-semibold tracking-tight">{{ t('vehicles.title') }}</h2>
        </div>
      </div>
    </div>

    <div class="p-4">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center gap-2 text-red-600 py-4">
        <AlertCircle class="w-5 h-5" />
        <span>{{ error }}</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!vehicles.length" class="text-gray-500 text-center py-4">
        {{ t('vehicles.noVehicles') }}
      </div>

      <div v-else class="space-y-6">
        <!-- Stats Overview -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <!-- Total Vehicles -->
          <div class="bg-purple-50 rounded-lg p-3">
            <div class="grid grid-rows-[54px_48px_24px_32px] h-full">
              <!-- Row 1: Label (fixed 54px height for 3 lines) -->
              <div class="flex items-start h-[54px] w-full">
                <div class="text-xs text-gray-600 uppercase tracking-wider leading-[18px] line-clamp-3 break-words w-full">{{ t('vehicles.stats.total') }}</div>
              </div>
              
              <!-- Row 2: Value -->
              <div class="flex items-center">
                <div class="text-4xl font-heading font-semibold text-purple-600 tabular-nums leading-none">
                  {{ vehicleStats.total }}
                </div>
              </div>
              
              <!-- Row 3: Indicator (vehicles count) -->
              <div class="flex items-center">
                <div class="text-xs text-gray-500">
                  {{ t('vehicles.stats.totalVehicles') }}
                </div>
              </div>
              
              <!-- Row 4: Link -->
              <div class="flex items-end w-full">
                <button 
                  @click="navigateToVehicle()"
                  class="flex items-center gap-1 text-xs font-medium text-purple-700 hover:text-purple-800 transition-colors"
                >
                  <span>{{ t('common.viewDetails') }}</span>
                  <ArrowRight class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Active Vehicles -->
          <div class="bg-green-50 rounded-lg p-3">
            <div class="grid grid-rows-[54px_48px_24px_32px] h-full">
              <!-- Row 1: Label (fixed 54px height for 3 lines) -->
              <div class="flex items-start h-[54px]">
                <div class="text-xs text-gray-600 uppercase tracking-wider leading-[18px] line-clamp-3">{{ t('vehicles.stats.active') }}</div>
              </div>
              
              <!-- Row 2: Value -->
              <div class="flex items-center">
                <div class="text-4xl font-heading font-semibold text-green-600 tabular-nums leading-none">
                  {{ vehicleStats.active }}
                </div>
              </div>
              
              <!-- Row 3: Indicator (description) -->
              <div class="flex items-center">
                <div class="text-xs text-gray-500">{{ t('vehicles.stats.activeVehicles') }}</div>
              </div>
              
              <!-- Row 4: Link -->
              <div class="flex items-end justify-end">
                <button 
                  @click="navigateToVehicle()"
                  class="flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-800 transition-colors"
                >
                  <span>{{ t('common.details') }}</span>
                  <ArrowRight class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Maintenance -->
          <div class="bg-orange-50 rounded-lg p-3">
            <div class="grid grid-rows-[54px_48px_24px_32px] h-full">
              <!-- Row 1: Label (fixed 54px height for 3 lines) -->
              <div class="flex items-start h-[54px]">
                <div class="text-xs text-gray-600 uppercase tracking-wider leading-[18px] line-clamp-3">{{ t('vehicles.stats.maintenance') }}</div>
              </div>
              
              <!-- Row 2: Value -->
              <div class="flex items-center">
                <div class="text-4xl font-heading font-semibold text-orange-600 tabular-nums leading-none">
                  {{ vehicleStats.maintenance }}
                </div>
              </div>
              
              <!-- Row 3: Indicator (description) -->
              <div class="flex items-center">
                <div class="text-xs text-gray-500">{{ t('vehicles.stats.maintenanceVehicles') }}</div>
              </div>
              
              <!-- Row 4: Link -->
              <div class="flex items-end justify-end">
                <button 
                  @click="navigateToVehicle()"
                  class="flex items-center gap-1 text-xs font-medium text-orange-700 hover:text-orange-800 transition-colors"
                >
                  <span>{{ t('common.details') }}</span>
                  <ArrowRight class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Low Fuel -->
          <div class="bg-red-50 rounded-lg p-3">
            <div class="grid grid-rows-[54px_48px_24px_32px] h-full">
              <!-- Row 1: Label (fixed 54px height for 3 lines) -->
              <div class="flex items-start h-[54px]">
                <div class="text-xs text-gray-600 uppercase tracking-wider leading-[18px] line-clamp-3">{{ t('vehicles.stats.lowFuel') }}</div>
              </div>
              
              <!-- Row 2: Value -->
              <div class="flex items-center">
                <div class="text-4xl font-heading font-semibold text-red-600 tabular-nums leading-none">
                  {{ vehicleStats.lowFuel }}
                </div>
              </div>
              
              <!-- Row 3: Indicator (description) -->
              <div class="flex items-center">
                <div class="text-xs text-gray-500">{{ t('vehicles.stats.lowFuelVehicles') }}</div>
              </div>
              
              <!-- Row 4: Link -->
              <div class="flex items-end justify-end">
                <button 
                  @click="navigateToVehicle()"
                  class="flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-800 transition-colors"
                >
                  <span>{{ t('common.details') }}</span>
                  <ArrowRight class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Vehicle List Section -->
        <div>
          <!-- Section Header -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-heading font-semibold text-gray-900">{{ t('vehicles.list.title') }}</h3>
              <span class="text-xs text-gray-500">{{ t('vehicles.list.showing') }} {{ Math.min(vehicles.length, 5) }} {{ t('common.of') }} {{ vehicles.length }}</span>
            </div>
          </div>

          <!-- Vehicle Cards -->
          <div class="grid gap-3 w-full">
            <div 
              v-for="vehicle in vehicles.slice(0, 5)" 
              :key="vehicle.id"
              class="group flex flex-col p-3 bg-white hover:bg-gray-50 transition-colors rounded-lg cursor-pointer border border-gray-100 hover:border-gray-200 shadow-sm"
              @click="navigateToVehicle(vehicle.id)"
            >
              <!-- Header: Name, Status, Actions -->
              <div class="flex items-start justify-between gap-3 mb-2">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-heading font-semibold text-gray-900 truncate">{{ vehicle.plateNumber }}</h3>
                    <!-- Status Badge -->
                    <span 
                      :class="[
                        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
                        getStatusColor(vehicle.status).bg,
                        getStatusColor(vehicle.status).text
                      ]"
                    >
                      <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="getStatusColor(vehicle.status).dot"></span>
                      {{ t(`vehicles.status.${vehicle.status}`) }}
                    </span>
                  </div>
                </div>

                <!-- Quick Actions -->
                <div class="flex items-center gap-2">
                  <button 
                    class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-medium text-purple-700 hover:text-purple-800"
                    @click.stop="navigateToVehicle(vehicle.id)"
                  >
                    <span>{{ t('common.viewDetails') }}</span>
                    <ArrowRight class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <!-- Info Grid -->
              <div class="grid grid-cols-2 gap-3 mb-2">
                <!-- Driver Info -->
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-gray-100 rounded">
                    <User class="w-4 h-4 text-gray-600" />
                  </div>
                  <div class="min-w-0">
                    <div class="text-xs font-medium text-gray-900 truncate">{{ vehicle.assignedDriver?.name }}</div>
                  </div>
                </div>
                <!-- Location -->
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-gray-100 rounded">
                    <MapPin class="w-4 h-4 text-gray-600" />
                  </div>
                  <div class="min-w-0">
                    <div class="text-xs font-medium text-gray-900 truncate">{{ vehicle.currentLocation?.address }}</div>
                  </div>
                </div>
              </div>

              <!-- Fuel Level -->
              <div class="flex items-center gap-2">
                <div class="p-1.5 bg-gray-100 rounded">
                  <FuelIcon class="w-4 h-4 text-gray-600" />
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-medium text-gray-900">{{ t('vehicles.fuel') }}</span>
                    <span class="text-xs font-medium text-gray-900 tabular-nums">{{ vehicle.fuelLevel }}%</span>
                  </div>
                  <div class="bg-gray-200 rounded-full h-1.5">
                    <div 
                      class="h-1.5 rounded-full transition-all duration-300" 
                      :class="getFuelLevelColor(vehicle.fuelLevel)"
                      :style="{ width: vehicle.fuelLevel + '%' }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Low Fuel Warning -->
              <div 
                v-if="vehicle.fuelLevel < 30" 
                class="flex items-center gap-1.5 text-red-600 mt-2 px-2 py-1.5 bg-red-50 rounded-lg"
              >
                <AlertTriangle class="w-4 h-4" />
                <span class="text-xs font-medium">{{ t('vehicles.lowFuel') }}</span>
              </div>
            </div>
          </div>

          <!-- View All Link -->
          <div v-if="vehicles.length > 5" class="flex justify-center mt-3">
            <button 
              @click="navigateToVehicle()"
              class="inline-flex items-center gap-1 px-4 py-2 text-xs font-medium text-purple-700 hover:text-purple-800 hover:bg-purple-50 transition-colors rounded-lg"
            >
              <span>{{ t('common.viewAllVehicles') }}</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
