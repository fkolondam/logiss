<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Fixed Header -->
    <AppHeader @toggle-sidebar="toggleSidebar" />
    
    <!-- Desktop Sidebar (hidden on mobile by default) -->
    <AppSidebar 
      :is-open="!isMobile || sidebarOpen"
      :is-mobile="isMobile"
      @close="closeSidebar"
    />
    
    <!-- Main Content -->
    <main class="transition-all duration-300 ease-in-out bg-white"
        :class="[ 
          'pt-[4.5rem]', // Header height 
          isMobile ? 'ml-0' : 'md:ml-64', // Sidebar width 
          { 'md:mr-96': showDetailSidebar } // Detail sidebar width 
        ]">
      <div class="p-6 pb-20 md:pb-6">
        <slot />
      </div>
    </main>
    
    <!-- Mobile Bottom Navigation -->
    <AppBottomNav />
  </div>
</template>
  
<script setup>
import { ref, computed, provide, onMounted, onUnmounted } from 'vue'
import AppHeader from '../components/layout/AppHeader.vue'
import AppSidebar from '../components/layout/AppSidebar.vue'
import AppBottomNav from '../components/layout/AppBottomNav.vue'

const sidebarOpen = ref(false)
const isMobile = ref(false)
const showDetailSidebar = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    sidebarOpen.value = true
  } else {
    sidebarOpen.value = false
  }
}

// Provide reactive references
provide('isMobile', isMobile)
provide('showDetailSidebar', showDetailSidebar)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<script>
export default {
  name: 'AppLayoutUpdated'
}
</script>
