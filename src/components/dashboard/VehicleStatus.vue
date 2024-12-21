<script setup>
import { computed } from 'vue'
import {
  Truck,
  AlertCircle,
  MapPin,
  User,
  Fuel as FuelIcon,
  AlertTriangle,
  ArrowRight,
} from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'
import { useRouter } from 'vue-router'

// Constants for status and thresholds
const VEHICLE_STATUS = {
  AVAILABLE: 'AVAILABLE',
  IN_USE: 'IN_USE',
  OUT_OF_SERVICE: 'OUT_OF_SERVICE',
}

const FUEL_THRESHOLDS = {
  LOW: 30,
  MEDIUM: 70,
}

const STATUS_STYLES = {
  [VEHICLE_STATUS.AVAILABLE]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-500',
  },
  [VEHICLE_STATUS.IN_USE]: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    dot: 'bg-orange-500',
  },
  [VEHICLE_STATUS.OUT_OF_SERVICE]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
  },
}

// Props definition with validation
const props = defineProps({
  vehicles: {
    type: Array,
    default: () => [],
    validator: (value) => {
      return (
        Array.isArray(value) &&
        value.every(
          (vehicle) =>
            typeof vehicle === 'object' &&
            'plateNumber' in vehicle &&
            'status' in vehicle &&
            'fuelLevel' in vehicle,
        )
      )
    },
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: [String, Object],
    default: null,
  },
})

const { t } = useTranslations()
const router = useRouter()

// Computed properties with validation
const vehicleStats = computed(() => {
  if (!Array.isArray(props.vehicles)) {
    console.warn('Invalid vehicles data provided')
    return {
      total: 0,
      available: 0,
      inUse: 0,
      outOfService: 0,
      lowFuel: 0,
    }
  }

  return props.vehicles.reduce(
    (stats, vehicle) => {
      if (!vehicle || typeof vehicle !== 'object') return stats

      stats.total++

      // Status counts with validation
      const status = vehicle.status?.toUpperCase?.()
      if (status === VEHICLE_STATUS.AVAILABLE) stats.available++
      else if (status === VEHICLE_STATUS.IN_USE) stats.inUse++
      else if (status === VEHICLE_STATUS.OUT_OF_SERVICE) stats.outOfService++

      // Fuel level check with validation
      const fuelLevel = Number(vehicle.fuelLevel)
      if (!isNaN(fuelLevel) && fuelLevel < FUEL_THRESHOLDS.LOW) {
        stats.lowFuel++
      }

      return stats
    },
    {
      total: 0,
      available: 0,
      inUse: 0,
      outOfService: 0,
      lowFuel: 0,
    },
  )
})

const displayedVehicles = computed(() => {
  if (!Array.isArray(props.vehicles)) return []
  return props.vehicles.filter((vehicle) => vehicle && typeof vehicle === 'object').slice(0, 5)
})

const hasMoreVehicles = computed(() => Array.isArray(props.vehicles) && props.vehicles.length > 5)

// Helper functions with validation
const getStatusColor = (status) => {
  const normalizedStatus = status?.toUpperCase?.()
  return STATUS_STYLES[normalizedStatus] || STATUS_STYLES[VEHICLE_STATUS.OUT_OF_SERVICE]
}

const getFuelLevelColor = (level) => {
  const fuelLevel = Number(level)
  if (isNaN(fuelLevel)) return 'bg-gray-600'

  if (fuelLevel > FUEL_THRESHOLDS.MEDIUM) return 'bg-green-600'
  if (fuelLevel > FUEL_THRESHOLDS.LOW) return 'bg-yellow-600'
  return 'bg-red-600'
}

const navigateToVehicle = (vehicleId) => {
  if (!vehicleId) {
    console.warn('No vehicle ID provided for navigation')
    router.push({ name: 'vehicles' })
    return
  }

  router.push({
    name: 'vehicles',
    params: { id: vehicleId },
  })
}

// Stats configuration for consistent rendering
const statsConfig = [
  {
    key: 'total',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    hoverColor: 'text-purple-700 hover:text-purple-800',
    icon: Truck,
  },
  {
    key: 'available',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    hoverColor: 'text-green-700 hover:text-green-800',
    icon: Truck,
  },
  {
    key: 'inUse',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    hoverColor: 'text-orange-700 hover:text-orange-800',
    icon: Truck,
  },
  {
    key: 'lowFuel',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    hoverColor: 'text-red-700 hover:text-red-800',
    icon: FuelIcon,
  },
]

// Error handling helper
const getErrorMessage = computed(() => {
  if (!props.error) return null
  if (typeof props.error === 'string') return props.error
  return props.error.message || t('errors.unexpectedError')
})
</script>

<template>
  <div class="bg-white rounded-lg shadow" data-testid="vehicle-status">
    <div class="p-4 border-b">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Truck class="w-5 h-5 text-purple-500" />
          <h2 class="text-base font-heading font-semibold tracking-tight">
            {{ t('vehicles.title') }}
          </h2>
        </div>
      </div>
    </div>

    <div class="p-4">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="getErrorMessage" class="flex items-start gap-2 text-red-600 py-4">
        <AlertCircle class="w-5 h-5 mt-0.5 shrink-0" />
        <div class="flex-1 space-y-1">
          <p class="font-medium">{{ getErrorMessage }}</p>
          <p v-if="typeof error === 'object' && error?.details" class="text-sm text-red-600">
            {{ error.details }}
          </p>
          <p v-if="typeof error === 'object' && error?.code" class="text-xs text-red-500">
            {{ t('errors.code') }}: {{ error.code }}
          </p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!vehicles?.length" class="text-gray-500 text-center py-4">
        {{ t('vehicles.noVehicles') }}
      </div>

      <div v-else class="space-y-6">
        <!-- Stats Overview -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            v-for="stat in statsConfig"
            :key="stat.key"
            :class="['rounded-lg p-3', stat.bgColor]"
          >
            <div class="grid grid-rows-[54px_48px_24px_32px] h-full">
              <div class="flex items-start h-[54px] w-full">
                <div
                  class="text-xs text-gray-600 uppercase tracking-wider leading-[18px] line-clamp-3 break-words w-full"
                >
                  {{ t(`vehicles.stats.${stat.key}`) }}
                </div>
              </div>

              <div class="flex items-center">
                <div
                  :class="[
                    'text-4xl font-heading font-semibold tabular-nums leading-none',
                    stat.textColor,
                  ]"
                >
                  {{ vehicleStats[stat.key] }}
                </div>
              </div>

              <div class="flex items-center">
                <div class="text-xs text-gray-500">
                  {{ t(`vehicles.stats.${stat.key}Vehicles`) }}
                </div>
              </div>

              <div class="flex items-end w-full">
                <button
                  @click="navigateToVehicle()"
                  :class="[
                    'flex items-center gap-1 text-xs font-medium transition-colors',
                    stat.hoverColor,
                  ]"
                >
                  <span>{{ t('common.viewDetails') }}</span>
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
              <h3 class="text-sm font-heading font-semibold text-gray-900">
                {{ t('vehicles.list.title') }}
              </h3>
              <span class="text-xs text-gray-500">
                {{ t('vehicles.list.showing') }} {{ displayedVehicles.length }}
                {{ t('common.of') }} {{ vehicles.length }}
              </span>
            </div>
          </div>

          <!-- Vehicle Cards -->
          <div class="grid gap-3 w-full">
            <div
              v-for="vehicle in displayedVehicles"
              :key="vehicle.id || vehicle.plateNumber"
              class="group flex flex-col p-3 bg-white hover:bg-gray-50 transition-colors rounded-lg cursor-pointer border border-gray-100 hover:border-gray-200 shadow-sm"
              @click="navigateToVehicle(vehicle.id)"
            >
              <!-- Vehicle Card Header -->
              <div class="flex items-start justify-between gap-3 mb-2">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-heading font-semibold text-gray-900 truncate">
                      {{ vehicle.plateNumber }}
                    </h3>
                    <!-- Status Badge -->
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
                        getStatusColor(vehicle.status).bg,
                        getStatusColor(vehicle.status).text,
                      ]"
                    >
                      <span
                        class="w-1.5 h-1.5 rounded-full mr-1.5"
                        :class="getStatusColor(vehicle.status).dot"
                      ></span>
                      {{ t(`vehicles.status.${vehicle.status}`) }}
                    </span>
                  </div>
                </div>

                <!-- Quick Actions -->
                <button
                  class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-medium text-purple-700 hover:text-purple-800"
                  @click.stop="navigateToVehicle(vehicle.id)"
                >
                  <span>{{ t('common.viewDetails') }}</span>
                  <ArrowRight class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Vehicle Info Grid -->
              <div class="grid grid-cols-2 gap-3 mb-2">
                <!-- Driver Info -->
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-gray-100 rounded">
                    <User class="w-4 h-4 text-gray-600" />
                  </div>
                  <div class="min-w-0">
                    <div class="text-xs font-medium text-gray-900 truncate">
                      {{ vehicle.assignedDriver?.name || t('vehicles.noDriver') }}
                    </div>
                  </div>
                </div>

                <!-- Location -->
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-gray-100 rounded">
                    <MapPin class="w-4 h-4 text-gray-600" />
                  </div>
                  <div class="min-w-0">
                    <div class="text-xs font-medium text-gray-900 truncate">
                      {{ vehicle.currentLocation?.address || t('vehicles.locationUnknown') }}
                    </div>
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
                    <span class="text-xs font-medium text-gray-900 tabular-nums"
                      >{{ vehicle.fuelLevel }}%</span
                    >
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
                v-if="Number(vehicle.fuelLevel) < FUEL_THRESHOLDS.LOW"
                class="flex items-center gap-1.5 text-red-600 mt-2 px-2 py-1.5 bg-red-50 rounded-lg"
              >
                <AlertTriangle class="w-4 h-4" />
                <span class="text-xs font-medium">{{ t('vehicles.lowFuel') }}</span>
              </div>
            </div>
          </div>

          <!-- View All Link -->
          <div v-if="hasMoreVehicles" class="flex justify-center mt-3">
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
