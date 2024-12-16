<template>
  <!-- Overlay for mobile -->
  <div v-if="isMobile"
       class="fixed inset-0 bg-black/50 z-[90] top-[4.5rem] bottom-[4.5rem]"
       @click="handleClose">
  </div>
  
  <!-- Detail Sidebar -->
  <aside v-if="delivery" 
         class="fixed bg-white shadow-lg border-l border-gray-200 z-[100] flex flex-col transform transition-transform duration-300 ease-out-cubic"
         :class="[
           isMobile ? 'inset-0 top-[4.5rem] bottom-[4.5rem]' : 'w-96 top-[4.5rem] right-0 bottom-0'
         ]"
         :style="{ transform: show ? 'translateX(0)' : 'translateX(100%)' }">
    <!-- Header -->
    <div class="flex-none">
      <div class="h-[4.5rem] px-4 flex items-center justify-between border-b">
        <h2 class="text-lg font-heading font-semibold tracking-tight">{{ t('deliveries.details') }}</h2>
        <button 
          @click="handleClose" 
          class="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-all duration-200"
          :title="t('common.close')"
        >
          <X class="w-5 h-5 icon-hover" />
        </button>
      </div>

      <!-- Status Bar -->
      <div :class="[
          'px-4 py-3 flex items-start gap-3',
          delivery.status === 'DITERIMA - SEMUA' ? 'bg-green-50' : 'bg-blue-50'
        ]">
        <CheckCircle2 v-if="delivery.status === 'DITERIMA - SEMUA'" class="w-5 h-5 text-green-500 mt-0.5 icon-hover" />
        <Clock v-else class="w-5 h-5 text-blue-500 mt-0.5 icon-hover" />
        <div>
          <label class="block text-xs text-gray-500 uppercase tracking-wide">{{ t('deliveries.table.status') }}</label>
          <span class="text-lg font-medium font-heading">{{ t(`deliveries.status.${delivery.status.toLowerCase()}`) }}</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          @click="activeTab = tab.key"
          class="flex items-center gap-2 px-4 py-2 relative text-sm transition-colors duration-200"
          :class="[activeTab === tab.key ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900']"
        >
          <component :is="tab.icon" class="w-4 h-4" />
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
          <div class="flex items-start gap-3">
            <Receipt class="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <label class="block text-xs text-gray-500 capitalize">{{ t('deliveries.table.invoice') }}</label>
              <span class="text-sm font-medium">{{ delivery.invoice }}</span>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <Calendar class="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <label class="block text-xs text-gray-500 capitalize">{{ t('deliveries.table.date') }}</label>
              <span class="text-sm font-medium">{{ `${delivery.date} ${delivery.time}` }}</span>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <Wallet class="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <label class="block text-xs text-gray-500 capitalize">{{ t('deliveries.table.amount') }}</label>
              <span class="text-sm font-medium">Rp {{ formatNumber(delivery.amount || 0) }}</span>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <CreditCard class="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <label class="block text-xs text-gray-500 capitalize">{{ t('deliveries.table.paymentMethod') }}</label>
              <span class="text-sm font-medium">{{ t(`deliveries.paymentMethod.${delivery.paymentMethod === 'TUNAI' ? 'cash' : 'kredit'}`) }}</span>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <User class="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <label class="block text-xs text-gray-500 capitalize">{{ t('deliveries.table.driver') }}</label>
              <span class="text-sm font-medium">{{ delivery.driver }}</span>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <Truck class="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <label class="block text-xs text-gray-500 capitalize">{{ t('deliveries.table.licensePlate') }}</label>
              <span class="text-sm font-medium">{{ delivery.vehicleNumber }}</span>
            </div>
          </div>
        </div>

        <!-- Customer Tab Content -->
        <div v-if="activeTab === 'customer'" class="space-y-4">
          <div class="flex items-start gap-3">
            <Building2 class="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <label class="block text-xs text-gray-500 capitalize">{{ t('deliveries.table.customer') }}</label>
              <span class="text-sm font-medium">{{ delivery.customer }}</span>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <MapPin class="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <label class="block text-xs text-gray-500 capitalize">{{ t('deliveries.table.location') }}</label>
              <span class="text-sm font-medium">{{ delivery.location }}</span>
            </div>
          </div>
        </div>

        <!-- Proof Tab Content -->
        <div v-if="activeTab === 'proof'" class="space-y-4">
          <div v-if="delivery.proofImage" class="aspect-w-4 aspect-h-3">
            <img :src="delivery.proofImage" alt="Delivery Proof" class="object-cover rounded-lg">
          </div>
          <div v-else class="flex flex-col items-center justify-center text-sm text-gray-500 text-center py-8">
            <ImageOff class="w-12 h-12 text-gray-300 mb-2" />
            {{ t('deliveries.noProofAvailable') }}
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../../stores/app'
import { useTranslations } from '../../composables/useTranslations'
import { 
  X, CheckCircle2, Clock, Receipt, Calendar, 
  Wallet, CreditCard, User, Truck, Building2, 
  MapPin, ImageOff, Package, Users, Image 
} from 'lucide-vue-next'

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

const emit = defineEmits(['close'])
const route = useRoute()
const appStore = useAppStore()
const show = ref(false)
const activeTab = ref('delivery')

const { t } = useTranslations()

const formatNumber = (value) => {
  return value.toLocaleString('id-ID')
}

const handleClose = () => {
  show.value = false
  setTimeout(() => {
    emit('close')
    appStore.closeRightSidebar()
  }, 300)
}

const tabs = [
  { 
    key: 'delivery', 
    translationKey: 'deliveries.tabs.delivery',
    icon: Package
  },
  { 
    key: 'customer', 
    translationKey: 'deliveries.tabs.customer',
    icon: Users
  },
  { 
    key: 'proof', 
    translationKey: 'deliveries.tabs.proof',
    icon: Image
  }
]

// Reset UI state when route changes
const unwatch = watch(
  () => route.name,
  (newRoute) => {
    if (newRoute !== 'deliveries') {
      appStore.resetUIState()
    }
  }
)

onMounted(() => {
  // Update global state
  appStore.openRightSidebar(props.delivery.invoice)
  // Trigger animation
  nextTick(() => {
    show.value = true
  })
})

onUnmounted(() => {
  unwatch()
})
</script>
