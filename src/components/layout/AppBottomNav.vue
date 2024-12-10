<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-gray-100 md:hidden z-50">
    <div class="grid grid-cols-4">
      <div 
        v-for="item in mainMenuItems" 
        :key="item.path"
        :class="[
          isActive(item.path) ? 'bg-white' : '',
          'h-full'
        ]"
      >
        <router-link
          :to="item.path"
          class="flex flex-col items-center py-4 h-full"
          :class="[
            isActive(item.path) ? getActiveColor(item.path) : 'text-gray-600'
          ]"
        >
          <component :is="item.icon" class="w-6 h-6" />
          <span class="text-xs mt-1"
          :class="[
            isActive(item.path) ? 'font-semibold' : ''
          ]"
          >{{ t(item.translationKey) }}</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { Home, Truck, Wallet, Gauge } from 'lucide-vue-next'
import { useTranslations } from '@/composables/useTranslations'

const route = useRoute()
const { t } = useTranslations()

const mainMenuItems = [
  { path: '/', icon: Home, translationKey: 'menu.home', color: 'text-menu-home' },
  { path: '/deliveries', icon: Truck, translationKey: 'menu.deliveries', color: 'text-menu-delivery' },
  { path: '/expenses', icon: Wallet, translationKey: 'menu.expenses', color: 'text-menu-expenses' },
  { path: '/vehicles', icon: Gauge, translationKey: 'menu.vehicles', color: 'text-menu-vehicles' }
]

const isActive = (path) => route.path === path

const getActiveColor = (path) => {
  const item = mainMenuItems.find(item => item.path === path)
  return item ? item.color : 'text-gray-600'
}
</script>
