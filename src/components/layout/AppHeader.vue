<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, User } from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'
import { useAppStore } from '../../stores/app'
import NotificationBell from '../notifications/NotificationBell.vue'

const route = useRoute()
const { t, currentLanguage, setLanguage } = useTranslations()
const appStore = useAppStore()

defineEmits(['toggle-sidebar'])

const getGradientColor = computed(() => {
  const gradients = {
    '/': 'from-menu-home to-menu-home/20',
    '/deliveries': 'from-menu-delivery to-menu-delivery/20',
    '/expenses': 'from-menu-expenses to-menu-expenses/20',
    '/vehicles': 'from-menu-vehicles to-menu-vehicles/20',
    '/profile': 'from-menu-profile to-menu-profile/20',
  }
  return gradients[route.path] || 'from-menu-home to-menu-home/20'
})
</script>

<template>
  <header class="h-16 bg-white shadow-sm fixed top-0 right-0 left-0 md:left-64 z-[60]">
    <div class="h-full px-4 flex items-center justify-between">
      <!-- Left Side -->
      <div class="flex items-center">
        <button
          class="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          @click="$emit('toggle-sidebar')"
        >
          <Menu class="w-6 h-6" />
        </button>
      </div>

      <!-- Right Side Menu -->
      <div class="flex items-center h-full gap-6 ml-auto">
        <!-- Language Toggle -->
        <div class="flex items-center gap-2 h-full">
          <button
            class="px-2 py-1 rounded text-sm"
            :class="currentLanguage === 'en' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'"
            @click="setLanguage('en')"
          >
            EN
          </button>
          <button
            class="px-2 py-1 rounded text-sm"
            :class="currentLanguage === 'id' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'"
            @click="setLanguage('id')"
          >
            ID
          </button>
        </div>

        <!-- Divider -->
        <div class="h-8 w-px bg-gray-200 self-center"></div>

        <!-- Notifications -->
        <div class="flex items-center h-full">
          <NotificationBell />
        </div>

        <!-- Divider -->
        <div class="h-8 w-px bg-gray-200 self-center"></div>

        <!-- User Menu -->
        <div class="flex items-center gap-3 h-full">
          <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User class="w-4 h-4 text-gray-500" />
          </div>
          <span class="text-sm font-medium text-gray-700 hidden md:block">{{
            appStore.user?.name || t('menu.profile')
          }}</span>
        </div>
      </div>
    </div>

    <!-- Gradient Line -->
    <div class="h-2 relative">
      <div :class="['absolute inset-0 bg-gradient-to-r', getGradientColor]">
        <div class="absolute inset-0">
          <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern
              id="dashPattern"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="40"
                stroke="white"
                stroke-width="500"
                stroke-dasharray="8,2,4,3,6,2,2,1"
              />
              <line
                x1="20"
                y1="0"
                x2="20"
                y2="40"
                stroke="white"
                stroke-width="1"
                stroke-dasharray="3,6,2,4,1,2"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#dashPattern)" opacity="0.2" />
          </svg>
        </div>
      </div>
    </div>
  </header>
</template>
