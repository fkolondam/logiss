<template>
  <div class="bg-white rounded-lg shadow">
    <div class="p-4">
      <div class="relative">
        <input
          type="text"
          :placeholder="t('deliveries.search')"
          class="w-full px-4 py-2 border rounded-lg pl-10"
          v-model="searchQuery"
        />
        <Search class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
      </div>
    </div>

    <!-- Desktop Table View -->
    <div class="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-y border-gray-200">
          <tr>
            <th v-for="header in headers" 
                :key="header"
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ t(header.translationKey) }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="delivery in deliveries" 
              :key="delivery.invoice"
              class="hover:bg-gray-50"
          >
            <td class="px-4 py-3">
              <span class="text-sm font-medium text-gray-900">{{ delivery.invoice }}</span>
            </td>
            <td class="px-4 py-3">
              <div>
                <div class="text-sm font-medium text-gray-900">{{ delivery.customer }}</div>
                <div class="text-sm text-gray-500">{{ delivery.location }}</div>
              </div>
            </td>
            <td class="px-4 py-3">
              <div>
                <div class="text-sm text-gray-900">{{ delivery.time }}</div>
                <div class="text-sm text-gray-500">{{ delivery.date }}</div>
              </div>
            </td>
            <td class="px-4 py-3">
              <span :class="[ 
                'px-3 py-1 rounded-full text-xs', 
                delivery.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800' 
              ]">
                {{ delivery.status }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div>
                <div class="text-sm font-medium text-gray-900">Rp {{ formatNumber(delivery.amount) }}</div>
                <div class="text-xs text-gray-500">{{ delivery.paymentMethod }}</div>
              </div>
            </td>
            <td class="px-4 py-3">
              <div>
                <div class="text-sm font-medium text-gray-900">{{ delivery.driver }}</div>
                <div class="text-xs text-gray-500">{{ delivery.licensePlate }}</div>
              </div>
            </td>
            <td class="px-4 py-3 text-right">
              <button 
                @click="$emit('show-detail', delivery)"
                class="text-blue-600 text-sm hover:text-blue-800"
              >
                {{ t('deliveries.table.details') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile List View -->
    <div class="md:hidden">
      <DeliveriesList 
        :deliveries="deliveries"
        @show-detail="$emit('show-detail', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { Search } from 'lucide-vue-next'
import DeliveriesList from './DeliveriesList.vue'
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()
const isMobile = inject('isMobile', ref(false))
const searchQuery = ref('')

const headers = [
  { translationKey: 'deliveries.table.invoice' },
  { translationKey: 'deliveries.table.customer' },
  { translationKey: 'deliveries.table.time' },
  { translationKey: 'deliveries.table.status' },
  { translationKey: 'deliveries.table.amount' },
  { translationKey: 'deliveries.table.driver' },
  { translationKey: 'deliveries.table.actions' }
]

const deliveries = [
  {
    invoice: 'SIH241108213',
    customer: 'PARJO',
    location: 'PS LAP BOLA',
    time: '11:28',
    date: '28/11/2024',
    status: 'Delivered',
    amount: 41394386,
    paymentMethod: 'KREDIT',
    driver: 'FAUZI',
    licensePlate: 'B9605NCJ'
  },
  {
    invoice: 'SIL241106885',
    customer: 'MASIDIK',
    location: 'JL SAMOLO CIHIDEUNG',
    time: '11:29',
    date: '28/11/2024',
    status: 'Delivered',
    amount: 525101,
    paymentMethod: 'KREDIT',
    driver: 'HAERUDIN',
    licensePlate: 'B9460SCN'
  },
  {
    invoice: '5613',
    customer: 'GAFAMART',
    location: 'TAMAN KARYA',
    time: '11:22',
    date: '28/11/2024',
    status: 'Partially Delivered',
    amount: 947203,
    paymentMethod: 'KREDIT',
    driver: 'Ade Nofri',
    licensePlate: 'BH8655MY'
  }
]

const formatNumber = (value) => {
  return value.toLocaleString('id-ID')
}

defineEmits(['show-detail'])
</script>
