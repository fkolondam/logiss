<template>
  <div class="space-y-4 p-4">
    <!-- Error State -->
    <div v-if="!Array.isArray(deliveries)" class="p-4 bg-red-50 text-red-600 rounded-lg">
      <div class="flex items-center gap-2">
        <AlertCircle class="w-5 h-5" />
        <span>{{ t('errors.invalidData') }}</span>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!filteredDeliveries.length"
      class="flex flex-col items-center justify-center text-center py-12 px-4"
    >
      <Package class="w-12 h-12 text-gray-300 mb-3" />
      <h3 class="text-lg font-medium text-gray-900 mb-1">{{ t('deliveries.noDeliveries') }}</h3>
      <p class="text-sm text-gray-500">{{ t('deliveries.noDeliveriesDesc') }}</p>
    </div>

    <!-- Content -->
    <TransitionGroup v-else name="list" tag="div" class="space-y-4">
      <div
        v-for="delivery in paginatedDeliveries"
        :key="delivery.invoice"
        class="bg-white rounded-xl border border-gray-200/80 overflow-hidden hover:border-primary-200 hover:shadow-lg transition-all duration-200 group"
      >
        <div class="p-4 space-y-4">
          <!-- Header Section -->
          <div class="pb-3.5 border-b border-gray-100">
            <!-- Invoice Number -->
            <div class="flex flex-col gap-2.5">
              <div class="flex items-center gap-2">
                <Receipt class="w-4 h-4 text-gray-400" />
                <span class="text-sm font-medium text-gray-900">{{ delivery.invoice }}</span>
              </div>

              <!-- Status Badge -->
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border shadow-sm self-start',
                  getStatusClass(delivery.status),
                ]"
              >
                <component :is="getStatusIcon(delivery.status)" class="w-3.5 h-3.5" />
                {{ t(`deliveries.status.${delivery.status.toLowerCase()}`) }}
              </span>
            </div>
          </div>

          <!-- Main Info Grid -->
          <div class="grid grid-cols-2 gap-5 pt-1">
            <!-- Left Column: Customer Info -->
            <div class="space-y-2.5">
              <div class="flex items-center gap-1.5">
                <Building2 class="w-4 h-4 text-gray-400" />
                <div class="text-xs font-medium text-gray-900">{{ delivery.customer }}</div>
              </div>
              <div class="flex items-start gap-1.5">
                <MapPin class="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                <span class="text-[11px] text-gray-500 break-words">{{ delivery.location }}</span>
              </div>
            </div>

            <!-- Right Column: Shipment Info -->
            <div class="space-y-2.5">
              <div class="flex items-center gap-1.5">
                <User class="w-4 h-4 text-gray-400" />
                <div class="text-xs font-medium text-gray-900">{{ delivery.driver }}</div>
              </div>
              <div class="flex items-center gap-1.5">
                <Truck class="w-3.5 h-3.5 text-gray-400" />
                <span class="text-[11px] text-gray-500">{{ delivery.vehicleNumber }}</span>
              </div>
            </div>
          </div>

          <!-- Date and Time -->
          <div class="flex items-center gap-2.5 pt-1.5">
            <Calendar class="w-3.5 h-3.5 text-gray-400" />
            <span class="text-[11px] text-gray-500">{{ formatDate(delivery.date) }}</span>
            <span class="text-gray-300 mx-1">•</span>
            <Clock class="w-3.5 h-3.5 text-gray-400" />
            <span class="text-[11px] text-gray-500">{{ delivery.time }}</span>
          </div>

          <!-- Amount -->
          <div class="flex items-start justify-between pt-2 border-t border-gray-100">
            <div class="text-xs text-gray-500">{{ t('deliveries.table.amount') }}</div>
            <div>
              <div class="text-xs font-medium text-gray-900 text-right">
                Rp {{ formatNumber(delivery.amount) }}
              </div>
              <div class="flex items-center gap-1.5 mt-0.5 justify-end">
                <component
                  :is="delivery.paymentMethod === 'TUNAI' ? Banknote : CreditCard"
                  class="w-3.5 h-3.5 text-gray-400"
                />
                <span class="text-[11px] text-gray-500">
                  {{
                    t(
                      `deliveries.paymentMethod.${delivery.paymentMethod === 'TUNAI' ? 'cash' : 'kredit'}`,
                    )
                  }}
                </span>
              </div>
            </div>
          </div>

          <!-- View Details -->
          <button
            @click.stop="$emit('show-detail', delivery)"
            class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 mt-2 rounded-lg text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50/50 hover:bg-primary-100/70 border border-primary-100 hover:border-primary-200"
          >
            <ArrowUpRight class="w-5 h-5" />
            {{ t('common.viewDetails') }}
          </button>
        </div>
      </div>
    </TransitionGroup>

    <!-- Pagination -->
    <div v-if="paginatedDeliveries.length" class="bg-white border-t border-gray-200/80 px-4 py-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="text-sm text-gray-700">
          {{ t('deliveries.pagination.showing') }}
          <span class="font-medium">{{ startIndex + 1 }}</span>
          {{ t('deliveries.pagination.to') }}
          <span class="font-medium">{{ Math.min(endIndex, filteredDeliveries.length) }}</span>
          {{ t('deliveries.pagination.of') }}
          <span class="font-medium">{{ filteredDeliveries.length }}</span>
          {{ t('deliveries.pagination.items') }}
        </div>
        <div class="flex items-center gap-2">
          <select
            v-model="perPage"
            class="pl-3 pr-8 py-1.5 text-xs font-medium text-gray-900 rounded-lg border border-gray-200 bg-white outline-none focus:border-primary-300 focus:ring-4 ring-primary-100/50"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <div class="flex items-center gap-1">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="p-1 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500"
            >
              <ChevronLeft class="w-5 h-5" />
            </button>
            <span class="min-w-[2rem] text-center text-sm font-medium text-gray-900">{{
              currentPage
            }}</span>
            <button
              @click="currentPage++"
              :disabled="endIndex >= filteredDeliveries.length"
              class="p-1 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500"
            >
              <ChevronRight class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import { useTranslations } from '../../composables/useTranslations'
import {
  Calendar,
  Receipt,
  Wallet,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  User,
  Truck,
  Package,
  Banknote,
  CreditCard,
  XCircle,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-vue-next'

const { t } = useTranslations()

const props = defineProps({
  deliveries: {
    type: Array,
    required: true,
    validator: (value) => {
      if (!Array.isArray(value)) return false
      return value.every(
        (delivery) =>
          typeof delivery === 'object' &&
          'invoice' in delivery &&
          'customer' in delivery &&
          'status' in delivery &&
          'amount' in delivery &&
          'date' in delivery,
      )
    },
  },
})

// Reset pagination when deliveries change
watch(
  () => props.deliveries,
  () => {
    currentPage.value = 1
  },
)

const currentPage = ref(1)
const perPage = ref(10)

// Computed properties
const filteredDeliveries = computed(() => {
  if (!Array.isArray(props.deliveries)) return []
  return [...props.deliveries]
})

const startIndex = computed(() => (currentPage.value - 1) * perPage.value)
const endIndex = computed(() => startIndex.value + perPage.value)
const paginatedDeliveries = computed(() =>
  filteredDeliveries.value.slice(startIndex.value, endIndex.value),
)

// Helper functions
const formatNumber = (value) => {
  if (typeof value !== 'number') return '0'
  return value.toLocaleString('id-ID')
}

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString)
    return format(date, 'dd MMM yyyy')
  } catch (error) {
    console.error('Invalid date:', dateString)
    return dateString
  }
}

const getStatusClass = (status) => {
  const classes = {
    'DITERIMA - SEMUA': 'bg-green-50 text-green-600 border-green-200',
    'DITERIMA - SEBAGIAN': 'bg-amber-50 text-amber-600 border-amber-200',
    'KIRIM ULANG': 'bg-blue-50 text-blue-600 border-blue-200',
  }
  return status.startsWith('BATAL')
    ? 'bg-red-50 text-red-600 border-red-200'
    : classes[status] || 'bg-gray-50 text-gray-600 border-gray-200'
}

const getStatusIcon = (status) => {
  if (status === 'DITERIMA - SEMUA') return CheckCircle2
  if (status === 'KIRIM ULANG') return ArrowUpRight
  if (status.startsWith('BATAL')) return XCircle
  return Clock
}

defineEmits(['show-detail'])
</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-active {
  position: absolute;
}
</style>
