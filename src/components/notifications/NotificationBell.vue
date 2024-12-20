<script setup>
import { Bell } from 'lucide-vue-next'
import { ref, onUnmounted } from 'vue'
import { useDashboardNotifications } from '../../composables/useDashboardNotifications'
import NotificationsPanel from './NotificationsPanel.vue'

const showNotifications = ref(false)
const { hasUnread, unreadNotifications } = useDashboardNotifications()

// Close panel when clicking outside
const handleClickOutside = (event) => {
  const panel = document.querySelector('[data-testid="notifications-panel"]')
  const bell = document.querySelector('[data-testid="notifications-button"]')

  if (
    showNotifications.value &&
    panel &&
    bell &&
    !panel.contains(event.target) &&
    !bell.contains(event.target)
  ) {
    showNotifications.value = false
  }
}

// Add click outside listener
document.addEventListener('click', handleClickOutside)

// Clean up listener on component unmount
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const handleClose = () => {
  showNotifications.value = false
}
</script>

<template>
  <div class="relative">
    <!-- Notification Bell Button -->
    <button
      class="p-2 rounded-lg text-gray-600 hover:bg-gray-100 relative"
      @click="toggleNotifications"
      data-testid="notifications-button"
    >
      <Bell class="w-5 h-5" />
      <span
        v-if="hasUnread"
        class="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full"
        data-testid="unread-badge"
      >
        {{ unreadNotifications.length }}
      </span>
    </button>

    <!-- Notifications Panel -->
    <NotificationsPanel :show="showNotifications" @close="handleClose" />
  </div>
</template>
