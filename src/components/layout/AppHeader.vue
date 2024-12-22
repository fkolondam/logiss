<template>
  <header class="h-16 bg-white shadow-sm fixed top-0 right-0 left-0 md:left-64 z-[60]">
    <div class="h-full flex items-center">
      <!-- Left Section -->
      <div class="flex items-center">
        <!-- Mobile Menu Button -->
        <div class="flex-none px-2 md:hidden">
          <button
            class="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            @click="$emit('toggle-sidebar')"
          >
            <Menu class="w-6 h-6" />
          </button>
        </div>

        <!-- Data Selector (Desktop) -->
        <div class="hidden md:flex items-center gap-2 px-4">
          <span class="text-sm text-gray-600 whitespace-nowrap">
            {{ t('dataSelector.filterBy') }}
          </span>
          <DataSelector />
        </div>
      </div>

      <!-- Center Section (Mobile Data Selector) -->
      <div class="flex-1 md:hidden flex items-center justify-center">
        <DataSelector />
      </div>

      <!-- Right Section -->
      <div class="flex-none px-2 flex items-center gap-1 sm:gap-2 ml-auto">
        <!-- Language Toggle (Desktop) -->
        <div class="hidden md:flex items-center">
          <div class="flex text-xs border border-gray-200 rounded-lg overflow-hidden">
            <button
              class="px-2 sm:px-3 py-1.5"
              :class="currentLanguage === 'en' ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'"
              @click="setLanguage('en')"
            >
              EN
            </button>
            <div class="w-px bg-gray-200"></div>
            <button
              class="px-2 sm:px-3 py-1.5"
              :class="currentLanguage === 'id' ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'"
              @click="setLanguage('id')"
            >
              ID
            </button>
          </div>
        </div>

        <!-- Language Toggle (Mobile) -->
        <button
          class="md:hidden px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
          :class="{ 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600': true }"
          @click="toggleLanguage"
        >
          {{ currentLanguage.toUpperCase() }}
        </button>

        <!-- Notifications -->
        <button class="p-2 rounded-lg text-gray-600 hover:bg-gray-100 relative">
          <Bell class="w-5 h-5" />
          <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <!-- User Profile -->
        <button
          class="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-lg"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <User class="w-4 h-4 text-gray-500" />
          </div>
          <div class="hidden md:block text-left">
            <div class="text-sm text-gray-700">
              {{ currentUser?.name || 'Profil' }}
            </div>
          </div>
        </button>
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

  <!-- Mobile Menu -->
  <div
    v-if="isMobileMenuOpen"
    class="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 md:hidden"
    @click="isMobileMenuOpen = false"
  ></div>
  <div
    v-if="isMobileMenuOpen"
    class="fixed inset-x-0 top-16 bg-white z-50 md:hidden border-b shadow-lg"
  >
    <!-- Profile Section -->
    <div class="p-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
          <User class="w-6 h-6 text-gray-500" />
        </div>
        <div>
          <div class="text-sm font-medium text-gray-900">
            {{ currentUser?.name || 'Profil' }}
          </div>
          <div class="text-xs text-gray-500">{{ getScopeLabel(currentUser?.scope) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, Bell, User } from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'
import { useUserStore } from '../../stores/user'
import DataSelector from './DataSelector.vue'

const route = useRoute()
const isMobileMenuOpen = ref(false)
const { t, currentLanguage, setLanguage } = useTranslations()
const userStore = useUserStore()

// Get current user from store
const currentUser = computed(() => userStore.currentUser)

// Toggle language on mobile
const toggleLanguage = () => {
  setLanguage(currentLanguage.value === 'en' ? 'id' : 'en')
}

// Get readable scope label
const getScopeLabel = (scope) => {
  if (!scope) return ''

  switch (scope.type) {
    case 'global':
      return t('scope.global')
    case 'region':
      return `${t('scope.region')}: ${scope.value}`
    case 'branch':
      return `${t('scope.branch')}: ${scope.value}`
    case 'personal':
      return `${t('scope.personal')}: ${scope.value}`
    default:
      return ''
  }
}

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
