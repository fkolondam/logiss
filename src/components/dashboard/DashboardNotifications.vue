<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { 
  Bell, 
  X as Close,
  AlertTriangle,
  CheckCircle,
  Info,
  Fuel,
  Wrench
} from 'lucide-vue-next'
import { useDashboardNotifications } from '../../composables/useDashboardNotifications'
import { useTranslations } from '../../composables/useTranslations'

const { t } = useTranslations()
const {
  notifications,
  unreadNotifications,
  markAsRead,
  markAllAsRead,
  removeNotification,
  NOTIFICATION_TYPES
} = useDashboardNotifications()

const showNotifications = ref(false)
const notificationSound = ref(null)

// Initialize notification sound
onMounted(() => {
  notificationSound.value = new Audio('/notification.mp3')
})

// Cleanup
onUnmounted(() => {
  notificationSound.value = null
})

// Play sound when new notifications arrive
watch(() => unreadNotifications.value.length, (newCount, oldCount) => {
  if (newCount > oldCount && notificationSound.value) {
    notificationSound.value.play().catch(() => {
      // Ignore audio play errors
    })
  }
})

// Get icon component based on notification type
const getNotificationIcon = (type) => {
  const icons = {
    'LOW_FUEL': Fuel,
    'MAINTENANCE_DUE': Wrench,
    'DELIVERY_FAILED': AlertTriangle,
    'DELIVERY_SUCCESS': CheckCircle,
    'default': Info
  }
  return icons[type] || icons.default
}

// Format notification time
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / (1000 * 60))
  
  if (diffInMinutes < 1) return t('common.justNow')
  if (diffInMinutes < 60) return t('common.minutesAgo', { minutes: diffInMinutes })
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return t('common.hoursAgo', { hours: diffInHours })
  
  const diffInDays = Math.floor(diffInHours / 24)
  return t('common.daysAgo', { days: diffInDays })
}

// Handle notification click
const handleNotificationClick = (notification) => {
  markAsRead(notification.id)
  if (notification.data?.vehicleId) {
    // Navigate to vehicle details
    router.push({ 
      name: 'vehicles',
      params: { id: notification.data.vehicleId }
    })
  } else if (notification.data?.deliveryId) {
    // Navigate to delivery details
    router.push({ 
      name: 'deliveries',
      query: { id: notification.data.deliveryId }
    })
  }
  showNotifications.value = false
}
</script>

<template>
  <div class="relative">
    <!-- Notification Bell -->
    <button 
      class="relative p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      @click="showNotifications = !showNotifications"
    >
      <Bell class="w-5 h-5 text-gray-600" />
      <!-- Unread Badge -->
      <span 
        v-if="unreadNotifications.length"
        class="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full"
      >
        {{ unreadNotifications.length }}
      </span>
    </button>

    <!-- Notifications Panel -->
    <div 
      v-if="showNotifications"
      class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
    >
      <!-- Header -->
      <div class="p-4 border-b">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">{{ t('notifications.title') }}</h3>
          <button 
            v-if="unreadNotifications.length"
            @click="markAllAsRead"
            class="text-sm text-blue-600 hover:text-blue-800"
          >
            {{ t('notifications.markAllRead') }}
          </button>
        </div>
      </div>

      <!-- Notification List -->
      <div class="max-h-96 overflow-y-auto">
        <div v-if="!notifications.length" class="p-4 text-center text-gray-500">
          {{ t('notifications.empty') }}
        </div>

        <div v-else class="divide-y">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            :class="[
              'p-4 hover:bg-gray-50 transition-colors cursor-pointer',
              { 'bg-blue-50': !notification.read }
            ]"
            @click="handleNotificationClick(notification)"
          >
            <div class="flex items-start gap-3">
              <!-- Icon -->
              <div 
                :class="[
                  'p-2 rounded-lg',
                  NOTIFICATION_TYPES[notification.type].bg
                ]"
              >
                <component 
                  :is="getNotificationIcon(notification.type)"
                  :class="[
                    'w-5 h-5',
                    NOTIFICATION_TYPES[notification.type].color
                  ]"
                />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">
                  {{ notification.title }}
                </p>
                <p class="mt-1 text-sm text-gray-500">
                  {{ notification.message }}
                </p>
                <p class="mt-1 text-xs text-gray-400">
                  {{ formatTime(notification.timestamp) }}
                </p>
              </div>

              <!-- Remove Button -->
              <button 
                @click.stop="removeNotification(notification.id)"
                class="p-1 rounded-lg hover:bg-gray-200"
              >
                <Close class="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t bg-gray-50 rounded-b-lg">
        <button 
          class="w-full text-center text-sm text-gray-600 hover:text-gray-900"
          @click="showNotifications = false"
        >
          {{ t('common.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Fade transition for notifications panel */
.notifications-enter-active,
.notifications-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.notifications-enter-from,
.notifications-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
