<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-heading font-bold text-gray-900">{{ t('deliveries.title') }}</h1>
    </div>
    
    <!-- Stats Section -->
    <DeliveryStats :stats="stats" :loading="loadingStats" />

    <!-- Table with Search and Filters -->
    <div class="relative transition-all duration-300 ease-out-cubic"
         :class="{ 'mr-96': !isMobile && showSidebar }">
      <div v-if="loading" 
           class="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
        <div class="flex flex-col items-center gap-3">
          <Loader2 class="w-8 h-8 text-primary-500 animate-spin" />
          <span class="text-sm text-gray-600">{{ t('deliveries.loading') }}</span>
        </div>
      </div>

      <div class="overflow-x-auto" :class="{ 'scroll-smooth': !isMobile && showSidebar }">
        <DeliveriesTable 
          :deliveries="deliveries"
          @show-detail="viewDelivery"
        />
      </div>
    </div>

    <!-- Detail Sidebar -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out-cubic"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-300 ease-out-cubic"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div v-if="selectedDelivery && showSidebar" 
           class="fixed inset-y-0 right-0 w-96">
        <DeliveryDetail
          :delivery="selectedDelivery"
          :is-mobile="isMobile"
          @close="closeDetail"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import { useTranslations } from '../composables/useTranslations'
import { dataProviderFactory } from '../services/DataProviderFactory'
import { Loader2 } from 'lucide-vue-next'
import DeliveryStats from '../components/deliveries/DeliveryStats.vue'
import DeliveryDetail from '../components/deliveries/DeliveryDetail.vue'
import DeliveriesTable from '../components/deliveries/DeliveriesTable.vue'

const { t } = useTranslations()
const appStore = useAppStore()
const route = useRoute()
const router = useRouter()
const provider = dataProviderFactory.getProvider()
const isMobile = inject('isMobile', ref(false))

const deliveries = ref([])
const stats = ref({})
const loading = ref(true)
const loadingStats = ref(true)
const selectedDelivery = ref(null)

// Computed property to control sidebar visibility
const showSidebar = computed(() => {
  return route.name === 'deliveries' && appStore.rightSidebarOpen
})

const fetchDeliveries = async () => {
  loading.value = true
  try {
    const params = { sort: 'date,desc' }
    deliveries.value = await provider.fetch('deliveries', params)
    
    // Restore selected delivery if exists in sidebar history
    if (appStore.shouldRestoreSidebar('deliveries')) {
      const { deliveryId } = appStore.sidebarHistory['deliveries']
      const delivery = deliveries.value.find(d => d.invoice === deliveryId)
      if (delivery) {
        selectedDelivery.value = delivery
        appStore.restoreSidebarState('deliveries')
      }
    }
  } catch (error) {
    console.error('Error fetching deliveries:', error)
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  loadingStats.value = true
  try {
    stats.value = await provider.getDeliveryStats()
  } catch (error) {
    console.error('Error fetching stats:', error)
  } finally {
    loadingStats.value = false
  }
}

const closeDetail = () => {
  selectedDelivery.value = null
  appStore.closeRightSidebar()
}

const viewDelivery = (delivery) => {
  selectedDelivery.value = delivery
  appStore.openRightSidebar(delivery.invoice)
}

// Watch for route changes
watch(
  () => route.name,
  (newRoute, oldRoute) => {
    if (newRoute !== 'deliveries') {
      // Save state before navigating away if sidebar is open
      if (selectedDelivery.value) {
        appStore.saveSidebarState()
      }
      // Reset local state but don't close sidebar yet
      selectedDelivery.value = null
    } else if (oldRoute !== 'deliveries') {
      // Coming back to deliveries view
      if (appStore.shouldRestoreSidebar('deliveries')) {
        const deliveryId = appStore.sidebarHistory['deliveries'].deliveryId
        const delivery = deliveries.value.find(d => d.invoice === deliveryId)
        if (delivery) {
          selectedDelivery.value = delivery
        }
      }
    }
  },
  { immediate: true }
)

// Watch for mobile changes
watch(isMobile, (newValue) => {
  if (newValue && showSidebar.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  appStore.setCurrentView('deliveries')
  fetchDeliveries()
  fetchStats()
})

onBeforeUnmount(() => {
  // Clean up
  document.body.style.overflow = ''
  
  // Save state if sidebar is open
  if (selectedDelivery.value) {
    appStore.saveSidebarState()
  }
})
</script>

<style scoped>
.ease-out-cubic {
  transition-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
}
</style>
