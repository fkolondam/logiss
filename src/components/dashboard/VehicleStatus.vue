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
        <div class="bg-blue-50/80 rounded-lg p-4 flex flex-col h-[160px]">
          <!-- Header (2 rows) -->
          <div class="mb-3 min-h-[40px]">
            <h3 class="text-sm font-medium text-blue-800/90 leading-snug">
              {{ t('vehicles.function.passenger') }}
            </h3>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <div class="flex items-baseline gap-2">
              <div class="text-3xl font-semibold text-blue-900">
                {{ stats?.byFunction?.['PASSENGER'] || 0 }}
              </div>
              <div class="text-sm font-medium text-blue-700">
                {{
                  stats?.total
                    ? Math.round(((stats.byFunction?.['PASSENGER'] || 0) / stats.total) * 100)
                    : 0
                }}%
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="mt-auto pt-2 border-t border-blue-100">
            <button
              class="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-0.5"
            >
              {{ t('common.viewDetails') }}
              <span class="text-[10px]">→</span>
            </button>
          </div>
        </div>

        <!-- Logistic Vehicles -->
        <div class="bg-green-50/80 rounded-lg p-4 flex flex-col h-[160px]">
          <!-- Header (2 rows) -->
          <div class="mb-3 min-h-[40px]">
            <h3 class="text-sm font-medium text-green-800/90 leading-snug">
              {{ t('vehicles.function.logistic') }}
            </h3>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <div class="flex items-baseline gap-2">
              <div class="text-3xl font-semibold text-green-900">
                {{ stats?.byFunction?.['LOGISTIC'] || 0 }}
              </div>
              <div class="text-sm font-medium text-green-700">
                {{
                  stats?.total
                    ? Math.round(((stats.byFunction?.['LOGISTIC'] || 0) / stats.total) * 100)
                    : 0
                }}%
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="mt-auto pt-2 border-t border-green-100">
            <button
              class="text-xs font-medium text-green-600 hover:text-green-700 transition-colors flex items-center gap-0.5"
            >
              {{ t('common.viewDetails') }}
              <span class="text-[10px]">→</span>
            </button>
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

      <div class="grid grid-cols-2 gap-4">
        <!-- STNK Expiry -->
        <div class="bg-yellow-50/80 rounded-lg p-4 flex flex-col h-[160px]">
          <!-- Header (2 rows) -->
          <div class="mb-3 min-h-[40px]">
            <h3 class="text-sm font-medium text-yellow-800/90 leading-snug">
              STNK {{ t('vehicles.documents.expiring') }}
            </h3>
            <div class="text-xs text-yellow-600/90 mt-0.5">
              {{ t('vehicles.documents.thisMonth') }}
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <div class="flex items-baseline gap-2">
              <div class="text-3xl font-semibold text-yellow-900">
                {{ stats?.documentExpiry?.stnk?.thisMonth || 0 }}
              </div>
              <div class="text-sm font-medium text-yellow-700">
                +{{ stats?.documentExpiry?.stnk?.nextThreeMonths || 0 }}
                {{ t('vehicles.documents.nextThreeMonths') }}
              </div>
            </div>
            <!-- Expiring vehicles list -->
            <div v-if="stats?.documentExpiry?.stnk?.expiringSoon?.length" class="mt-2">
              <div
                v-for="vehicle in stats.documentExpiry.stnk.expiringSoon.slice(0, 2)"
                :key="vehicle.vehicleNumber"
                class="text-xs text-yellow-700/90"
              >
                {{ vehicle.vehicleNumber }} - {{ formatDate(vehicle.expiryDate) }}
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="mt-auto pt-2 border-t border-yellow-100">
            <button
              class="text-xs font-medium text-yellow-600 hover:text-yellow-700 transition-colors flex items-center gap-0.5"
            >
              {{ t('common.viewDetails') }}
              <span class="text-[10px]">→</span>
            </button>
          </div>
        </div>

        <!-- Tax Expiry -->
        <div class="bg-orange-50/80 rounded-lg p-4 flex flex-col h-[160px]">
          <!-- Header (2 rows) -->
          <div class="mb-3 min-h-[40px]">
            <h3 class="text-sm font-medium text-orange-800/90 leading-snug">
              {{ t('vehicles.documents.tax') }}
            </h3>
            <div class="text-xs text-orange-600/90 mt-0.5">
              {{ t('vehicles.documents.thisMonth') }}
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <div class="flex items-baseline gap-2">
              <div class="text-3xl font-semibold text-orange-900">
                {{ stats?.documentExpiry?.tax?.thisMonth || 0 }}
              </div>
              <div class="text-sm font-medium text-orange-700">
                +{{ stats?.documentExpiry?.tax?.nextThreeMonths || 0 }}
                {{ t('vehicles.documents.nextThreeMonths') }}
              </div>
            </div>
            <!-- Expiring vehicles list -->
            <div v-if="stats?.documentExpiry?.tax?.expiringSoon?.length" class="mt-2">
              <div
                v-for="vehicle in stats.documentExpiry.tax.expiringSoon.slice(0, 2)"
                :key="vehicle.vehicleNumber"
                class="text-xs text-orange-700/90"
              >
                {{ vehicle.vehicleNumber }} - {{ formatDate(vehicle.expiryDate) }}
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="mt-auto pt-2 border-t border-orange-100">
            <button
              class="text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-0.5"
            >
              {{ t('common.viewDetails') }}
              <span class="text-[10px]">→</span>
            </button>
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
