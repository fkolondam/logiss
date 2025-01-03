<template>
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-900">{{ t('vehicles.title') }}</h2>
      <div class="text-sm text-gray-500">
        {{ t('vehicles.stats.total') }}: {{ stats?.total || 0 }}
      </div>
    </div>

    <!-- Vehicle Function Overview -->
    <div class="mb-6">
      <div class="grid grid-cols-2 gap-4">
        <!-- Passenger Vehicles -->
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="text-sm text-blue-700 mb-2">{{ t('vehicles.function.passenger') }}</div>
          <div class="text-2xl font-bold text-blue-900">
            {{ stats?.byFunction?.['PASSENGER'] || 0 }}
          </div>
        </div>
        <!-- Logistic Vehicles -->
        <div class="bg-green-50 rounded-lg p-4">
          <div class="text-sm text-green-700 mb-2">{{ t('vehicles.function.logistic') }}</div>
          <div class="text-2xl font-bold text-green-900">
            {{ stats?.byFunction?.['LOGISTIC'] || 0 }}
          </div>
        </div>
      </div>
    </div>

    <!-- Logistic Type Breakdown -->
    <div class="mb-6">
      <h3 class="text-sm font-medium text-gray-700 mb-4">{{ t('vehicles.logisticType.title') }}</h3>
      <div class="space-y-4">
        <div
          v-for="(count, type) in stats?.byLogisticType"
          :key="type"
          class="flex items-center gap-3"
        >
          <div class="bg-indigo-50 p-2 rounded-lg">
            <Truck class="w-5 h-5 text-indigo-600" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <div class="text-sm font-medium text-gray-700">{{ type }}</div>
              <div class="text-sm text-gray-900 font-medium">{{ count }}</div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5">
              <div
                class="h-1.5 rounded-full bg-indigo-500"
                :style="{ width: `${(count / stats.total) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ownership Type -->
    <div class="mb-6">
      <h3 class="text-sm font-medium text-gray-700 mb-4">{{ t('vehicles.ownership.title') }}</h3>
      <div class="space-y-4">
        <div
          v-for="(count, type) in stats?.byOwnership"
          :key="type"
          class="flex items-center gap-3"
        >
          <div class="bg-purple-50 p-2 rounded-lg">
            <Key class="w-5 h-5 text-purple-600" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-1">
              <div class="text-sm font-medium text-gray-700">{{ type }}</div>
              <div class="text-sm text-gray-900 font-medium">{{ count }}</div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5">
              <div
                class="h-1.5 rounded-full bg-purple-500"
                :style="{ width: `${(count / stats.total) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Document Expiry Alerts -->
    <div class="mb-6">
      <h3 class="text-sm font-medium text-gray-700 mb-4">{{ t('vehicles.documents.expiry') }}</h3>

      <!-- STNK Expiry -->
      <div class="space-y-4 mb-4">
        <div class="bg-yellow-50 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="text-sm font-medium text-yellow-800">
              STNK {{ t('vehicles.documents.expiring') }}
            </div>
            <div class="text-sm font-medium text-yellow-800">
              {{ stats?.documentExpiry?.stnk?.thisMonth || 0 }}
              {{ t('vehicles.documents.thisMonth') }}
            </div>
          </div>
          <div class="text-xs text-yellow-600">
            {{ stats?.documentExpiry?.stnk?.nextThreeMonths || 0 }}
            {{ t('vehicles.documents.nextThreeMonths') }}
          </div>
          <!-- Expiring vehicles list -->
          <div v-if="stats?.documentExpiry?.stnk?.expiringSoon?.length" class="mt-2 space-y-1">
            <div
              v-for="vehicle in stats.documentExpiry.stnk.expiringSoon"
              :key="vehicle.vehicleNumber"
              class="text-xs text-yellow-700"
            >
              {{ vehicle.vehicleNumber }} - {{ formatDate(vehicle.expiryDate) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tax Expiry -->
      <div class="space-y-4">
        <div class="bg-orange-50 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="text-sm font-medium text-orange-800">{{ t('vehicles.documents.tax') }}</div>
            <div class="text-sm font-medium text-orange-800">
              {{ stats?.documentExpiry?.tax?.thisMonth || 0 }}
              {{ t('vehicles.documents.thisMonth') }}
            </div>
          </div>
          <div class="text-xs text-orange-600">
            {{ stats?.documentExpiry?.tax?.nextThreeMonths || 0 }}
            {{ t('vehicles.documents.nextThreeMonths') }}
          </div>
          <!-- Expiring vehicles list -->
          <div v-if="stats?.documentExpiry?.tax?.expiringSoon?.length" class="mt-2 space-y-1">
            <div
              v-for="vehicle in stats.documentExpiry.tax.expiringSoon"
              :key="vehicle.vehicleNumber"
              class="text-xs text-orange-700"
            >
              {{ vehicle.vehicleNumber }} - {{ formatDate(vehicle.expiryDate) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vehicles Needing Attention -->
    <div v-if="stats?.needsAttention?.length">
      <h3 class="text-sm font-medium text-gray-700 mb-4">{{ t('vehicles.attention.title') }}</h3>
      <div class="space-y-3">
        <div
          v-for="vehicle in stats.needsAttention"
          :key="vehicle.vehicleNumber"
          class="bg-red-50 rounded-lg p-4"
        >
          <div class="flex items-center gap-2">
            <AlertCircle class="w-4 h-4 text-red-600" />
            <div class="text-sm font-medium text-red-800">{{ vehicle.vehicleNumber }}</div>
          </div>
          <div class="mt-1 text-xs text-red-600">{{ vehicle.info }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Truck, Key, AlertCircle } from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'

const { t } = useTranslations()

const props = defineProps({
  stats: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

// Format date helper
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Make stats reactive
const stats = computed(() => props.stats || {})
</script>
