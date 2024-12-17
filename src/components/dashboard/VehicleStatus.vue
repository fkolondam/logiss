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
            <div class="grid grid-rows-[36px_48px_24px_32px] h-full">
              <!-- Row 1: Label (fixed 36px height for 2 lines) -->
              <div class="flex items-start h-[36px]">
                <div class="text-[9px] text-gray-600 uppercase tracking-wider leading-[18px] line-clamp-2">{{ t('vehicles.stats.total') }}</div>
              </div>
              
              <!-- Row 2: Value -->
              <div class="flex items-center">
                <div class="text-4xl font-heading font-semibold text-purple-600 tabular-nums leading-none">
                  {{ vehicleStats.total }}
                </div>
              </div>
              
              <!-- Row 3: Indicator (empty for consistency) -->
              <div class="flex items-center"></div>
              
              <!-- Row 4: Link -->
              <div class="flex items-end justify-end">
                <button 
                  @click="navigateToVehicle()"
                  class="flex items-center gap-1 text-[9px] font-medium text-purple-700 hover:text-purple-800 transition-colors"
                >
                  <span>{{ t('common.viewAll') }}</span>
                  <ArrowRight class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <!-- Active Vehicles -->
          <div class="bg-green-50 rounded-lg p-3">
            <div class="grid grid-rows-[36px_48px_24px_32px] h-full">
              <!-- Row 1: Label (fixed 36px height for 2 lines) -->
              <div class="flex items-start h-[36px]">
                <div class="text-[9px] text-gray-600 uppercase tracking-wider leading-[18px] line-clamp-2">{{ t('vehicles.stats.active') }}</div>
              </div>
              
              <!-- Row 2: Value -->
              <div class="flex items-center">
                <div class="text-4xl font-heading font-semibold text-green-600 tabular-nums leading-none">
                  {{ vehicleStats.active }}
                </div>
              </div>
              
              <!-- Row 3: Indicator (empty for consistency) -->
              <div class="flex items-center"></div>
              
              <!-- Row 4: Link -->
              <div class="flex items-end justify-end">
                <button 
                  @click="navigateToVehicle()"
                  class="flex items-center gap-1 text-[9px] font-medium text-green-700 hover:text-green-800 transition-colors"
                >
                  <span>{{ t('common.details') }}</span>
                  <ArrowRight class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <!-- Maintenance -->
          <div class="bg-orange-50 rounded-lg p-3">
            <div class="grid grid-rows-[36px_48px_24px_32px] h-full">
              <!-- Row 1: Label (fixed 36px height for 2 lines) -->
              <div class="flex items-start h-[36px]">
                <div class="text-[9px] text-gray-600 uppercase tracking-wider leading-[18px] line-clamp-2">{{ t('vehicles.stats.maintenance') }}</div>
              </div>
              
              <!-- Row 2: Value -->
              <div class="flex items-center">
                <div class="text-4xl font-heading font-semibold text-orange-600 tabular-nums leading-none">
                  {{ vehicleStats.maintenance }}
                </div>
              </div>
              
              <!-- Row 3: Indicator (empty for consistency) -->
              <div class="flex items-center"></div>
              
              <!-- Row 4: Link -->
              <div class="flex items-end justify-end">
                <button 
                  @click="navigateToVehicle()"
                  class="flex items-center gap-1 text-[9px] font-medium text-orange-700 hover:text-orange-800 transition-colors"
                >
                  <span>{{ t('common.details') }}</span>
                  <ArrowRight class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <!-- Low Fuel -->
          <div class="bg-red-50 rounded-lg p-3">
            <div class="grid grid-rows-[36px_48px_24px_32px] h-full">
              <!-- Row 1: Label (fixed 36px height for 2 lines) -->
              <div class="flex items-start h-[36px]">
                <div class="text-[9px] text-gray-600 uppercase tracking-wider leading-[18px] line-clamp-2">{{ t('vehicles.stats.lowFuel') }}</div>
              </div>
              
              <!-- Row 2: Value -->
              <div class="flex items-center">
                <div class="text-4xl font-heading font-semibold text-red-600 tabular-nums leading-none">
                  {{ vehicleStats.lowFuel }}
                </div>
              </div>
              
              <!-- Row 3: Indicator (empty for consistency) -->
              <div class="flex items-center"></div>
              
              <!-- Row 4: Link -->
              <div class="flex items-end justify-end">
                <button 
                  @click="navigateToVehicle()"
                  class="flex items-center gap-1 text-[9px] font-medium text-red-700 hover:text-red-800 transition-colors"
                >
                  <span>{{ t('common.details') }}</span>
                  <ArrowRight class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Vehicle List -->
        <div class="space-y-3">
          <div 
            v-for="vehicle in vehicles" 
            :key="vehicle.id"
            class="flex flex-col p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg cursor-pointer"
            @click="navigateToVehicle(vehicle.id)"
          >
            <div class="flex items-start justify-between gap-4 mb-3">
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-heading font-semibold text-gray-900 truncate">{{ vehicle.name }}</h3>
                <div class="mt-2 flex flex-wrap gap-3">
                  <!-- Driver Info -->
                  <div class="flex items-center gap-1.5">
                    <User class="w-3.5 h-3.5 text-gray-500" />
                    <span class="text-xs font-medium text-gray-700">{{ vehicle.driver }}</span>
                  </div>
                  <!-- Location -->
                  <div class="flex items-center gap-1.5">
                    <MapPin class="w-3.5 h-3.5 text-gray-500" />
                    <span class="text-xs font-medium text-gray-700">{{ vehicle.location }}</span>
                  </div>
                </div>
              </div>

              <!-- Status Badge -->
              <span 
                :class="[
                  'inline-block px-2 py-0.5 text-2xs font-medium rounded-full',
                  getStatusColor(vehicle.status).bg,
                  getStatusColor(vehicle.status).text
                ]"
              >
                {{ t(`vehicles.status.${vehicle.status}`) }}
              </span>
            </div>

            <!-- Fuel Level -->
            <div class="flex items-center gap-2">
              <FuelIcon class="w-3.5 h-3.5 text-gray-500" />
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-2xs font-medium text-gray-600">{{ t('vehicles.fuel') }}</span>
                  <span class="text-2xs font-medium text-gray-600 tabular-nums">{{ vehicle.fuelLevel }}%</span>
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

            <!-- Low Fuel Warning -->
            <div v-if="vehicle.fuelLevel < 30" class="flex items-center gap-1 text-red-600 mt-2">
              <AlertTriangle class="w-3 h-3" />
              <span class="text-2xs font-medium">{{ t('vehicles.lowFuel') }}</span>
            </div>

            <!-- View Details -->
            <button 
              class="flex items-center gap-1 text-2xs font-medium text-purple-700 hover:text-purple-800 transition-colors mt-3 self-end"
              @click.stop="navigateToVehicle(vehicle.id)"
            >
              <span>{{ t('common.viewDetails') }}</span>
              <ArrowRight class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
