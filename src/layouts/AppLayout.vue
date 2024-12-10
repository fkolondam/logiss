<template>
    <div class="min-h-screen bg-white">
      <!-- Desktop Sidebar (hidden on mobile by default) -->
      <AppSidebar 
        :is-open="!isMobile || sidebarOpen"
        :is-mobile="isMobile"
        @close="closeSidebar"
      />
      
      <AppHeader @toggle-sidebar="toggleSidebar" />
      
      <main class="pt-[4.5rem] transition-all duration-300 ease-in-out"
          :class="[
            isMobile ? 'ml-0' : 'md:ml-64',
            { 'md:mr-96': showDetailSidebar }
          ]">
      <div class="p-6 pb-20 md:pb-6">
        <slot />
      </div>
    </main>
    
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
  
  // Provide isMobile sebagai reactive reference
  provide('isMobile', isMobile)

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