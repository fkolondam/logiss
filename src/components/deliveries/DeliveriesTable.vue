<template>
  <div class="card">
    <!-- Search and Filters -->
    <div class="p-4 border-b border-gray-200/80 bg-white sticky top-0 z-30">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Search Bar -->
        <div class="relative flex-1 group">
          <div class="relative">
            <input
              type="text"
              :placeholder="t('deliveries.search')"
              class="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 group-hover:border-primary-200 focus:border-primary-300 focus:ring-4 ring-primary-100/50 shadow-sm group-hover:shadow-md font-medium"
              v-model="searchQuery"
              :disabled="loading"
            />
            <div
              class="absolute left-3 top-2.5 p-1 rounded-md text-gray-400 group-hover:text-primary-500 group-focus-within:text-primary-500 transition-all duration-200"
            >
              <Search
                class="w-5 h-5 transition-transform duration-200 group-focus-within:scale-110"
              />
            </div>
          </div>
        </div>

        <!-- Filter Button -->
        <button
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-primary-50 text-gray-700 hover:text-primary-600 transition-all duration-200 group border border-gray-200 hover:border-primary-200 focus:ring-4 ring-primary-100/50 shadow-sm hover:shadow-md active:scale-95"
          :disabled="loading"
        >
          <div class="p-1 rounded-md transition-all duration-200">
            <SlidersHorizontal
              class="w-4 h-4 transition-transform duration-200 group-hover:rotate-12"
            />
          </div>
          <span class="font-medium">{{ t('deliveries.filter') }}</span>
        </button>
      </div>
    </div>

    <!-- Desktop Table View -->
    <div class="hidden md:block">
      <div class="relative overflow-x-auto">
        <table class="min-w-[1160px] w-full">
          <!-- Fixed Header -->
          <thead class="sticky top-0 z-50 bg-gray-50/80 border-y border-gray-200/80">
            <tr class="grid grid-cols-[200px_320px_220px_140px_180px_100px] px-6 py-3">
              <th class="text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-2.5">
                  <Receipt class="w-4 h-4 text-gray-400" />
                  {{ t('deliveries.table.invoice') }}
                </div>
              </th>
              <th class="text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-2.5">
                  <Building2 class="w-4 h-4 text-gray-400" />
                  {{ t('deliveries.table.customer') }}
                </div>
              </th>
              <th class="text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-gray-400" />
                  {{ t('deliveries.table.status') }}
                </div>
              </th>
              <th
                class="text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider px-4"
              >
                <div class="flex items-center justify-end gap-2.5">
                  <Wallet class="w-4 h-4 text-gray-400" />
                  {{ t('deliveries.table.amount') }}
                </div>
              </th>
              <th class="text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-2.5">
                  <Truck class="w-4 h-4 text-gray-400" />
                  {{ t('deliveries.table.shipment') }}
                </div>
              </th>
              <th class="text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('deliveries.table.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template v-if="!loading">
              <tr
                v-for="delivery in paginatedDeliveries"
                :key="delivery.invoice"
                class="grid grid-cols-[200px_320px_220px_140px_180px_100px] px-6 py-3 hover:bg-gray-50/80 cursor-pointer group items-start"
                @click="$emit('show-detail', delivery)"
              >
                <td class="flex items-center gap-2">
                  <Receipt class="w-4 h-4 text-gray-400" />
                  <span class="text-xs font-medium text-gray-900">{{ delivery.invoice }}</span>
                </td>
                <td class="min-w-0 space-y-2">
                  <p class="flex items-center gap-1.5">
                    <Building2 class="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span class="text-xs font-medium text-gray-900">{{ delivery.customer }}</span>
                  </p>
                  <p class="flex items-start gap-1.5">
                    <MapPin class="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span class="text-[11px] text-gray-500 break-words">{{
                      delivery.location
                    }}</span>
                  </p>
                </td>
                <td class="space-y-2">
                  <div>
                    <span
                      :class="[
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border shadow-sm',
                        {
                          'bg-green-50 text-green-600 border-green-200':
                            delivery.status === 'DITERIMA - SEMUA',
                          'bg-amber-50 text-amber-600 border-amber-200':
                            delivery.status === 'DITERIMA - SEBAGIAN',
                          'bg-red-50 text-red-600 border-red-200':
                            delivery.status.startsWith('BATAL'),
                          'bg-blue-50 text-blue-600 border-blue-200':
                            delivery.status === 'KIRIM ULANG',
                        },
                      ]"
                    >
                      <component
                        :is="
                          delivery.status === 'DITERIMA - SEMUA'
                            ? CheckCircle2
                            : delivery.status === 'KIRIM ULANG'
                              ? ArrowUpRight
                              : delivery.status.startsWith('BATAL')
                                ? XCircle
                                : Clock
                        "
                        class="w-3.5 h-3.5"
                      />
                      {{ t(`deliveries.status.${delivery.status.toLowerCase()}`) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1.5 ml-2">
                    <Calendar class="w-3 h-3 flex-shrink-0 text-gray-400" />
                    <span class="text-[10px] text-gray-500">{{ delivery.date }}</span>
                    <span class="text-gray-300 mx-1">•</span>
                    <Clock class="w-3 h-3 flex-shrink-0 text-gray-400" />
                    <span class="text-[10px] text-gray-500">{{ delivery.time }}</span>
                  </div>
                </td>
                <td class="px-4 min-w-[90px]">
                  <div class="text-xs font-medium text-gray-900 text-right">
                    Rp {{ formatNumber(delivery.amount) }}
                  </div>
                  <div class="text-[11px] text-gray-500 flex items-center gap-1.5 mt-1 justify-end">
                    <component
                      :is="delivery.paymentMethod === 'TUNAI' ? Banknote : CreditCard"
                      class="w-3.5 h-3.5 flex-shrink-0"
                    />
                    <span>{{
                      t(
                        `deliveries.paymentMethod.${delivery.paymentMethod === 'TUNAI' ? 'cash' : 'credit'}`,
                      )
                    }}</span>
                  </div>
                </td>
                <td class="pl-6 space-y-2">
                  <p class="flex items-center gap-1.5">
                    <User class="w-4 h-4 text-gray-400" />
                    <span class="text-xs font-medium text-gray-900 truncate">{{
                      delivery.driver
                    }}</span>
                  </p>
                  <p class="flex items-center gap-1.5">
                    <Truck class="w-3.5 h-3.5 text-gray-400" />
                    <span class="text-[11px] text-gray-500 truncate">{{
                      delivery.vehicleNumber
                    }}</span>
                  </p>
                </td>
                <td class="flex justify-center items-start pt-1">
                  <button
                    class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50/50 hover:bg-primary-100/70 border border-primary-100 hover:border-primary-200"
                  >
                    <ArrowUpRight class="w-4 h-4" />
                    {{ t('common.viewDetails') }}
                  </button>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="i in 5"
                :key="i"
                class="grid grid-cols-[200px_320px_220px_140px_180px_100px] px-6 py-3 animate-pulse"
              >
                <td class="flex items-center gap-2">
                  <div class="w-4 h-4 bg-gray-200 rounded"></div>
                  <div class="w-24 h-4 bg-gray-200 rounded"></div>
                </td>
                <td class="space-y-2">
                  <div class="w-32 h-4 bg-gray-200 rounded"></div>
                  <div class="w-48 h-4 bg-gray-200 rounded"></div>
                </td>
                <td class="space-y-2">
                  <div class="w-24 h-6 bg-gray-200 rounded-full"></div>
                  <div class="w-32 h-4 bg-gray-200 rounded"></div>
                </td>
                <td class="px-4">
                  <div class="w-20 h-4 bg-gray-200 rounded ml-auto"></div>
                </td>
                <td class="space-y-2">
                  <div class="w-28 h-4 bg-gray-200 rounded"></div>
                  <div class="w-24 h-4 bg-gray-200 rounded"></div>
                </td>
                <td class="flex justify-center">
                  <div class="w-20 h-8 bg-gray-200 rounded"></div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
        <!-- Desktop Pagination -->
        <div class="bg-white border-t border-gray-200/80 px-6 py-4">
          <div class="flex items-center justify-between gap-4">
            <div class="text-sm text-gray-700">
              {{ t('deliveries.pagination.showing') }}
              <span class="font-medium">{{ startIndex + 1 }}</span>
              {{ t('deliveries.pagination.to') }}
              <span class="font-medium">{{ Math.min(endIndex, deliveries.length) }}</span>
              {{ t('deliveries.pagination.of') }}
              <span class="font-medium">{{ deliveries.length }}</span>
              {{ t('deliveries.pagination.items') }}
            </div>
            <div class="flex items-center gap-2">
              <select
                v-model="perPage"
                class="pl-3 pr-8 py-1.5 text-xs font-medium text-gray-900 rounded-lg border border-gray-200 bg-white outline-none focus:border-primary-300 focus:ring-4 ring-primary-100/50"
                :disabled="loading"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <div class="flex items-center gap-1">
                <button
                  @click="currentPage--"
                  :disabled="currentPage === 1 || loading"
                  class="p-1 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                >
                  <ChevronLeft class="w-5 h-5" />
                </button>
                <span class="min-w-[2rem] text-center text-sm font-medium text-gray-900">{{
                  currentPage
                }}</span>
                <button
                  @click="currentPage++"
                  :disabled="endIndex >= deliveries.length || loading"
                  class="p-1 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                >
                  <ChevronRight class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile List View -->
    <div class="md:hidden">
      <DeliveriesList
        :deliveries="paginatedDeliveries"
        :loading="loading"
        @show-detail="$emit('show-detail', $event)"
      />
      <!-- Mobile Pagination -->
      <div class="bg-white border-t border-gray-200/80 px-4 py-4">
        <div class="flex flex-col gap-4">
          <button
            @click="currentPage++"
            :disabled="endIndex >= deliveries.length || loading"
            class="w-full py-2.5 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50/50 hover:bg-primary-100/70 border border-primary-100 hover:border-primary-200 rounded-xl disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-primary-600"
          >
            {{ t('deliveries.pagination.loadMore') }}
          </button>
          <div class="text-xs text-center text-gray-500">
            {{ t('deliveries.pagination.showing') }}
            <span class="font-medium">{{ Math.min(endIndex, deliveries.length) }}</span>
            {{ t('deliveries.pagination.of') }}
            <span class="font-medium">{{ deliveries.length }}</span>
            {{ t('deliveries.pagination.items') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, watch } from 'vue'
import {
  Search,
  SlidersHorizontal,
  Receipt,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Wallet,
  User,
  ArrowUpRight,
  MapPin,
  Truck,
  Banknote,
  CreditCard,
  Loader2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'
import DeliveriesList from './DeliveriesList.vue'
import { useTranslations } from '../../composables/useTranslations'

const { t } = useTranslations()
const isMobile = inject('isMobile', ref(false))
const searchQuery = ref('')
const currentPage = ref(1)
const perPage = ref(10)

const props = defineProps({
  deliveries: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

// Reset pagination when deliveries change
watch(
  () => props.deliveries,
  () => {
    currentPage.value = 1
  },
)

// Computed properties for pagination
const startIndex = computed(() => (currentPage.value - 1) * perPage.value)
const endIndex = computed(() => startIndex.value + perPage.value)
const paginatedDeliveries = computed(() => props.deliveries.slice(startIndex.value, endIndex.value))

const formatNumber = (value) => {
  return value.toLocaleString('id-ID')
}

defineEmits(['show-detail'])
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
