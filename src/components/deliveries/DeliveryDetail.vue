<template>
  <!-- Overlay for mobile -->
  <div v-if="isMobile"
       class="fixed inset-0 bg-black/50 z-30"
       @click="$emit('close')">
  </div>
  
  <!-- Detail Sidebar -->
  <Transition
    :enter-active-class="isMobile ? 'transition-transform duration-300 ease-out' : 'transition-all duration-300 ease-out delay-300'"
    :leave-active-class="isMobile ? 'transition-transform duration-300 ease-in' : 'transition-all duration-300 ease-in'"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <aside v-if="delivery" 
           class="fixed bg-white shadow-xl z-40 flex flex-col border-l border-gray-200"
           :class="[isMobile ? 'top-0 inset-x-0 h-[calc(100%-4rem)]' : 'w-96 top-[4.5rem] right-0 bottom-0']">
      <!-- Header -->
      <div class="flex-none">
        <div class="h-[4.5rem] px-4 flex items-center justify-between border-b">
          <h2 class="text-lg font-semibold">{{ t('deliveries.details') }}</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Status Bar - Always visible -->
        <div :class="[
            'px-4 py-3 ',
            delivery.status === 'Delivered' ? 'bg-green-100' : 'bg-blue-100'
          ]">
          <label class="block text-xs text-gray-500 capitalize">{{ t('deliveries.table.status') }}</label>
          <span class="text-sm font-medium">{{ t(delivery.status === 'Delivered' ? 'deliveries.status.delivered' : 'deliveries.status.partiallyDelivered') }}</span>
        </div>

        <!-- Tabs -->
        <div class="flex border-b">
          <button 
            v-for="tab in tabs" 
            :key="tab.key"
            @click="activeTab = tab.key"
            class="px-4 py-2 relative"
            :class="[activeTab === tab.key ? 'text-blue-600' : 'text-gray-500']"
          >
            {{ t(tab.translationKey) }}
            <div 
              v-if="activeTab === tab.key"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
            ></div>
          </button>
        </div>
      </div>
      
      <!-- Content (scrollable) -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-4">
          <!-- Delivery Tab Content -->
          <div v-if="activeTab === 'delivery'" class="space-y-4">
            <div>
              <label class="block text-xs text-gray-500 capitalize">{{ t('deliveries.table.invoice') }}</label>
              <span class="text-sm font-medium">{{ delivery.invoice }}</span>
            </div>

            <div>
              <label class="block text-xs text-gray-500 capitalize">{{ t('deliveries.table.date') }}</label>
              <span class="text-sm font-medium">{{ `${delivery.date} ${delivery.time}` }}</span>
            </div>

            <div>
              <label class="block text-xs text-gray-500 capitalize">{{ t('deliveries.table.amount') }}</label>
              <span class="text-sm font-medium">Rp {{ formatNumber(delivery.amount) }}</span>
            </div>

            <div>
              <label class="block text-xs text-gray-500 capitalize">{{ t('deliveries.table.paymentMethod') }}</label>
              <span class="text-sm font-medium">{{ delivery.paymentMethod }}</span>
            </div>

            <div>
              <label class="block text-xs text-gray-500 capitalize">{{ t('deliveries.table.driver') }}</label>
              <span class="text-sm font-medium">{{ delivery.driver }}</span>
            </div>

            <div>
              <label class="block text-xs text-gray-500 capitalize">{{ t('deliveries.table.licensePlate') }}</label>
              <span class="text-sm font-medium">{{ delivery.licensePlate }}</span>
            </div>
          </div>

          <!-- Customer Tab Content -->
          <div v-if="activeTab === 'customer'" class="space-y-4">
            <div>
              <label class="block text-xs text-gray-500 capitalize">{{ t('deliveries.table.customer') }}</label>
              <span class="text-sm font-medium">{{ delivery.customer }}</span>
            </div>
            <div>
              <label class="block text-xs text-gray-500 capitalize">{{ t('deliveries.table.location') }}</label>
              <span class="text-sm font-medium">{{ delivery.location }}</span>
            </div>
          </div>

          <!-- Proof Tab Content -->
          <div v-if="activeTab === 'proof'" class="space-y-4">
            <!-- Proof content here -->
          </div>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { useTranslations } from '@/composables/useTranslations'

const props = defineProps({
  delivery: {
    type: Object,
    required: true
  },
  isMobile: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])

const tabs = [
  { key: 'delivery', translationKey: 'deliveries.tabs.delivery' },
  { key: 'customer', translationKey: 'deliveries.tabs.customer' },
  { key: 'proof', translationKey: 'deliveries.tabs.proof' }
]
const activeTab = ref('delivery')

const { t } = useTranslations()

const formatNumber = (value) => {
  return value.toLocaleString('id-ID')
}
</script>

<style scoped>
.delay-300 {
  transition-delay: 300ms;
}
</style>
