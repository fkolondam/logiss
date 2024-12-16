<template>
  <!-- Overlay for mobile -->
  <div v-if="isMobile && delivery"
       class="fixed inset-0 bg-black/50 z-[40] top-16 bottom-16 transition-opacity duration-300 ease-out-cubic"
       :class="{ 'opacity-0 pointer-events-none': !show }"
       @click="handleClose">
  </div>
  
  <!-- Detail Sidebar -->
  <aside v-if="delivery" 
         class="fixed bg-white shadow-float border-l border-gray-200/80 z-[45] flex flex-col transform will-change-transform transition-transform duration-300 ease-out-cubic"
         :class="[
           isMobile ? 'inset-x-0 top-16 bottom-16 shadow-none border-l-0' : 'w-96 top-16 right-0 bottom-0',
           !show ? 'translate-x-full' : 'translate-x-0'
         ]">
    <!-- Header -->
    <div class="flex-none">
      <div class="h-[4.5rem] px-4 flex items-center justify-between border-b border-gray-200/80 bg-white">
        <div class="flex items-center gap-3">
          <button v-if="isMobile"
                  @click="handleClose"
                  class="p-2 -ml-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 active:bg-gray-200/80 transition-all duration-200">
            <ArrowLeft class="w-5 h-5" />
          </button>
          <h2 class="text-lg font-display font-bold tracking-tight text-gray-900">{{ t('deliveries.details') }}</h2>
        </div>
        <button v-if="!isMobile"
                @click="handleClose" 
                class="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 active:bg-gray-200/80 transition-all duration-200"
                :title="t('common.close')">
          <X class="w-5 h-5 icon-hover" />
        </button>
      </div>

      <!-- Status Bar -->
      <div :class="[
          'px-4 py-3 flex items-start gap-3 transition-colors duration-200',
          delivery.status === 'DITERIMA - SEMUA' 
            ? 'bg-green-50/80 border-y border-green-100/80 hover:bg-green-50' 
            : delivery.status === 'DITERIMA - SEBAGIAN'
            ? 'bg-amber-50/80 border-y border-amber-100/80 hover:bg-amber-50'
            : delivery.status.startsWith('BATAL')
            ? 'bg-red-50/80 border-y border-red-100/80 hover:bg-red-50'
            : 'bg-blue-50/80 border-y border-blue-100/80 hover:bg-blue-50'
        ]">
        <component 
          :is="delivery.status === 'DITERIMA - SEMUA' ? CheckCircle2 :
               delivery.status === 'KIRIM ULANG' ? ArrowUpRight :
               delivery.status.startsWith('BATAL') ? XCircle :
               Clock"
          :class="[
            'w-5 h-5 mt-0.5 icon-hover',
            delivery.status === 'DITERIMA - SEMUA' ? 'text-green-600' :
            delivery.status === 'DITERIMA - SEBAGIAN' ? 'text-amber-600' :
            delivery.status.startsWith('BATAL') ? 'text-red-600' :
            'text-blue-600'
          ]"
        />
        <div>
          <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">{{ t('deliveries.table.status') }}</label>
          <span :class="[
            'text-lg font-display font-medium tracking-tight',
            delivery.status === 'DITERIMA - SEMUA' ? 'text-green-600' :
            delivery.status === 'DITERIMA - SEBAGIAN' ? 'text-amber-600' :
            delivery.status.startsWith('BATAL') ? 'text-red-600' :
            'text-blue-600'
          ]">{{ t(`deliveries.status.${delivery.status.toLowerCase()}`) }}</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200/80 bg-white/80 backdrop-blur-sm">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          @click="activeTab = tab.key"
          class="flex-1 flex items-center justify-center gap-2 px-4 py-3 relative text-sm font-medium transition-all duration-200"
          :class="[
            activeTab === tab.key 
              ? 'text-primary-600 font-medium bg-primary-50/50' 
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/80'
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ t(tab.translationKey) }}
          <div 
            v-if="activeTab === tab.key"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
          ></div>
        </button>
      </div>
    </div>
    
    <!-- Content (scrollable) -->
    <div class="flex-1 overflow-y-auto scrollbar-elegant">
      <div class="p-4 space-y-4">
        <!-- Delivery Tab Content -->
        <div v-if="activeTab === 'delivery'" key="delivery" class="space-y-3">
          <div class="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors duration-200 group">
            <Receipt class="w-5 h-5 text-gray-400 mt-0.5 group-hover:text-primary-500 transition-colors duration-200" />
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide font-display">{{ t('deliveries.table.invoice') }}</label>
              <span class="text-sm font-display text-gray-900">{{ delivery.invoice }}</span>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors duration-200 group">
            <Calendar class="w-5 h-5 text-gray-400 mt-0.5 group-hover:text-primary-500 transition-colors duration-200" />
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide font-display">{{ t('deliveries.table.date') }}</label>
              <span class="text-sm font-medium text-gray-900">{{ `${delivery.date} ${delivery.time}` }}</span>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors duration-200 group">
            <Wallet class="w-5 h-5 text-gray-400 mt-0.5 group-hover:text-primary-500 transition-colors duration-200" />
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide font-display">{{ t('deliveries.table.amount') }}</label>
              <div class="flex items-center gap-2">
                <span class="text-sm font-display text-gray-900">Rp {{ formatNumber(delivery.amount || 0) }}</span>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100/80 text-gray-600 font-medium">
                  <component :is="delivery.paymentMethod === 'TUNAI' ? Banknote : CreditCard" class="w-3 h-3" />
                  {{ t(`deliveries.paymentMethod.${delivery.paymentMethod === 'TUNAI' ? 'cash' : 'kredit'}`) }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors duration-200 group">
            <User class="w-5 h-5 text-gray-400 mt-0.5 group-hover:text-primary-500 transition-colors duration-200" />
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide font-display">{{ t('deliveries.table.driver') }}</label>
              <span class="text-sm font-medium text-gray-900">{{ delivery.driver }}</span>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors duration-200 group">
            <Truck class="w-5 h-5 text-gray-400 mt-0.5 group-hover:text-primary-500 transition-colors duration-200" />
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide font-display">{{ t('deliveries.table.licensePlate') }}</label>
              <span class="text-sm font-display text-gray-900">{{ delivery.vehicleNumber }}</span>
            </div>
          </div>
        </div>

        <!-- Customer Tab Content -->
        <div v-if="activeTab === 'customer'" key="customer" class="space-y-4">
          <div class="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors duration-200 group">
            <Building2 class="w-5 h-5 text-gray-400 mt-0.5 group-hover:text-primary-500 transition-colors duration-200" />
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide font-display">{{ t('deliveries.table.customer') }}</label>
              <span class="text-sm font-medium text-gray-900">{{ delivery.customer }}</span>
            </div>
          </div>
          
          <div class="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors duration-200 group">
            <MapPin class="w-5 h-5 text-gray-400 mt-0.5 group-hover:text-primary-500 transition-colors duration-200" />
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide font-display">{{ t('deliveries.table.location') }}</label>
              <span class="text-sm font-medium text-gray-900">{{ delivery.location }}</span>
            </div>
          </div>

          <!-- Map -->
          <div v-if="delivery.coordinates" class="mt-4 rounded-xl overflow-hidden shadow-subtle hover:shadow-float transition-all duration-200">
            <iframe
              width="100%"
              height="200"
              frameborder="0"
              style="border:0"
              :src="getMapUrl"
              allowfullscreen
            ></iframe>
          </div>
        </div>

        <!-- Proof Tab Content -->
        <div v-if="activeTab === 'proof'" key="proof" class="space-y-4">
          <div v-if="delivery.proofImage" class="relative group">
            <div v-if="!imageLoaded" class="w-full h-48 bg-gray-100 rounded-xl animate-pulse"></div>
            <iframe
              :src="getProofImageUrl(delivery.proofImage)"
              class="w-full h-[400px] rounded-xl shadow-subtle group-hover:shadow-float transition-all duration-200 border-0"
              @load="handleImageLoad"
              :class="{ 'hidden': !imageLoaded }"
            ></iframe>
            <div class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                 v-show="imageLoaded">
              <button 
                @click="openImage(delivery.proofImage)"
                class="p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 shadow-subtle hover:shadow-float transition-all duration-200"
                :title="t('common.openInNewTab')"
              >
                <ExternalLink class="w-4 h-4" />
              </button>
              <button 
                class="p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 shadow-subtle hover:shadow-float transition-all duration-200"
                :title="t('common.share')"
              >
                <Share2 class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div v-else class="flex flex-col items-center justify-center gap-2 text-sm text-gray-500 text-center py-8 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors duration-200">
            <ImageOff class="w-12 h-12 text-gray-300 group-hover:text-gray-400 transition-colors duration-200" />
            {{ t('deliveries.noProofAvailable') }}
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../../stores/app'
import { useTranslations } from '../../composables/useTranslations'
import { 
  X, CheckCircle2, Clock, Receipt, Calendar, 
  Wallet, CreditCard, User, Truck, Building2, 
  MapPin, ImageOff, Package, Users, Image,
  Share2, ExternalLink, Banknote, ArrowLeft,
  ArrowUpRight, XCircle
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
const imageLoaded = ref(false)

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

const openImage = (url) => {
  window.open(url, '_blank')
}

const handleImageLoad = () => {
  imageLoaded.value = true
}

// Computed property for Google Maps URL
const getMapUrl = computed(() => {
  if (!props.delivery?.coordinates) return ''
  return `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${props.delivery.coordinates.lat},${props.delivery.coordinates.lng}`
})

// Convert Google Drive view URL to direct image URL
const getProofImageUrl = (url) => {
  if (!url) return ''
  // Extract file ID from Google Drive URL
  const fileId = url.match(/\/d\/(.*?)\/view/)?.[1]
  if (!fileId) return url
  // Return direct image URL using Google Drive's direct preview URL
  return `https://drive.google.com/file/d/${fileId}/preview?embedded=true`
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
  (newRoute, oldRoute) => {
    if (oldRoute === 'deliveries' && newRoute !== 'deliveries') {
      // Save state before navigating away
      appStore.saveSidebarState()
    }
  }
)

onMounted(() => {
  // Update global state
  appStore.openRightSidebar(props.delivery.invoice)
  // Trigger animation with delay for smooth entrance
  nextTick(() => {
    show.value = true
  })
})

onUnmounted(() => {
  unwatch()
  // Save state before unmounting
  if (route.name === 'deliveries') {
    appStore.saveSidebarState()
  }
})
</script>
