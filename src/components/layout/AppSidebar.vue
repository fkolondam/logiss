<template>
  <aside 
    class="fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-20"
    :class="{'translate-x-0': isOpen, '-translate-x-full': !isOpen}"
  >
    <!-- Logo -->
    <div class="h-16 px-6 flex items-center">
      <img src="/src/assets/logo.svg" alt="Fleet Management" class="h-8">
    </div>

    <!-- Navigation -->
    <nav class="px-4 py-4">
      <router-link 
        v-for="item in menuItems" 
        :key="item.path"
        :to="item.path"
        class="flex items-center px-2 py-2 rounded-lg text-gray-600 hover:bg-gray-50 mb-1"
        :class="{ 'bg-blue-50 text-blue-600': isActive(item.path) }"
        @click="isMobile && $emit('close')"
      >
        <component 
          :is="item.icon" 
          class="w-5 h-5 mr-3"
          :class="{ 'text-blue-600': isActive(item.path) }"
        />
        <span :class="{ 'font-medium': isActive(item.path) }">
          {{ item.translationKey ? t(item.translationKey) : item.label }}
        </span>
      </router-link>
    </nav>

    <!-- Mobile Close Button -->
    <button 
      v-if="isMobile"
      class="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-500"
      @click="$emit('close')"
    >
      <X class="w-5 h-5" />
    </button>
  </aside>

  <!-- Mobile Backdrop -->
  <div 
    v-if="isMobile && isOpen"
    class="fixed inset-0 bg-gray-600 bg-opacity-75 z-10"
    @click="$emit('close')"
  ></div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { Home, Truck, Wallet, Gauge, User, LogOut, X, Bug } from 'lucide-vue-next'
import { useTranslations } from '@/composables/useTranslations'

const route = useRoute()
const { t } = useTranslations()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  isMobile: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])

const menuItems = [
  { path: '/', icon: Home, translationKey: 'menu.home' },
  { path: '/deliveries', icon: Truck, translationKey: 'menu.deliveries' },
  { path: '/expenses', icon: Wallet, translationKey: 'menu.expenses' },
  { path: '/vehicles', icon: Gauge, translationKey: 'menu.vehicles' },
  { path: '/profile', icon: User, translationKey: 'menu.profile' },
  { path: '/debug', icon: Bug, label: 'Debug Tools' }, // Using label instead of translationKey
  { path: '/logout', icon: LogOut, translationKey: 'menu.logout' }
]

const isActive = (path) => route.path === path
</script>
