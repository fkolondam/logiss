<script setup>
import { ref, computed } from 'vue'
import { Bell } from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'
import NotificationsPanel from './NotificationsPanel.vue'

const props = defineProps({
  notifications: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: [String, Object],
    default: null,
  },
})

const { t } = useTranslations()
const showPanel = ref(false)

const unreadCount = computed(() => {
  if (!Array.isArray(props.notifications)) return 0
  return props.notifications.filter((notification) => !notification.read).length
})

const togglePanel = () => {
  showPanel.value = !showPanel.value
}
</script>

<template>
  <div class="relative">
    <!-- Notification Bell -->
    <button
      class="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg"
      @click="togglePanel"
      data-testid="notifications-button"
    >
      <Bell class="w-5 h-5" />
      <!-- Unread Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
      ></span>
    </button>

    <!-- Notifications Panel -->
    <NotificationsPanel
      v-if="showPanel"
      :notifications="notifications"
      :loading="loading"
      :error="error"
      @close="showPanel = false"
    />
  </div>
</template>
