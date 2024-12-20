<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  X as Close,
  AlertTriangle,
  CheckCircle,
  Info,
  Fuel,
  Wrench,
  AlertOctagon,
  Clock,
} from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'
import { useDashboardNotifications } from '../../composables/useDashboardNotifications'

const router = useRouter()
const { t } = useTranslations()
const {
  notifications,
  hasUnread,
  error,
  markAsRead,
  markAllAsRead,
  removeNotification,
  NOTIFICATION_TYPES,
} = useDashboardNotifications()

// Get notification type key from id
const getTypeFromId = (id) => {
  return Object.keys(NOTIFICATION_TYPES).find((key) => NOTIFICATION_TYPES[key].id === id)
}

// Get icon component based on notification type
const getNotificationIcon = (type) => {
  const typeKey = getTypeFromId(type)
  const icons = {
    LOW_FUEL: Fuel,
    MAINTENANCE_DUE: Wrench,
    DELIVERY_FAILED: AlertTriangle,
    DELIVERY_SUCCESS: CheckCircle,
    ERROR: AlertOctagon,
    SYSTEM: Clock,
  }
  return icons[typeKey] || Info
}

// Get notification styles
const getNotificationStyles = (type) => {
  const typeKey = getTypeFromId(type)
  return typeKey ? NOTIFICATION_TYPES[typeKey] : { bg: 'bg-gray-50', color: 'text-gray-500' }
}

// Format notification time
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

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

  // Handle different notification types
  switch (notification.type) {
    case NOTIFICATION_TYPES.LOW_FUEL.id:
    case NOTIFICATION_TYPES.MAINTENANCE_DUE.id:
    case NOTIFICATION_TYPES.ERROR.id:
      if (notification.data?.vehicleId) {
        router.push({
          name: 'vehicles',
          params: { id: notification.data.vehicleId },
        })
      }
      break

    case NOTIFICATION_TYPES.DELIVERY_FAILED.id:
    case NOTIFICATION_TYPES.DELIVERY_SUCCESS.id:
    case NOTIFICATION_TYPES.SYSTEM.id:
      if (notification.data?.deliveryId) {
        router.push({
          name: 'deliveries',
          query: { id: notification.data.deliveryId },
        })
      }
      break
  }

  emit('close')
}

// Group notifications by date
const groupedNotifications = computed(() => {
  const groups = {}
  const today = new Date().setHours(0, 0, 0, 0)
  const yesterday = new Date(today - 86400000).setHours(0, 0, 0, 0)

  notifications.value.forEach((notification) => {
    const date = new Date(notification.timestamp).setHours(0, 0, 0, 0)
    let groupKey

    if (date === today) {
      groupKey = t('common.today')
    } else if (date === yesterday) {
      groupKey = t('common.yesterday')
    } else {
      groupKey = new Date(date).toLocaleDateString()
    }

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(notification)
  })

  return groups
})

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close'])

// Handle remove notification
const handleRemoveNotification = (event, id) => {
  event.stopPropagation()
  removeNotification(id)
}

// Handle mark all as read
const handleMarkAllAsRead = () => {
  markAllAsRead()
}
</script>

<template>
  <!-- Notifications Panel -->
  <div
    v-if="show"
    class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
    data-testid="notifications-panel"
  >
    <!-- Header -->
    <div class="p-4 border-b">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">{{ t('notifications.title') }}</h3>
        <button
          v-if="hasUnread"
          @click="handleMarkAllAsRead"
          class="text-sm text-blue-600 hover:text-blue-800"
          data-testid="mark-all-read"
        >
          {{ t('notifications.markAllRead') }}
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="p-4 bg-red-50 border-b border-red-100">
      <div class="flex items-start gap-3">
        <AlertOctagon class="w-5 h-5 text-red-500" />
        <div>
          <p class="text-sm font-medium text-red-800">{{ error.message }}</p>
          <p v-if="error.details" class="mt-1 text-sm text-red-600">{{ error.details }}</p>
        </div>
      </div>
    </div>

    <!-- Notification List -->
    <div class="max-h-96 overflow-y-auto">
      <div v-if="!notifications.length" class="p-4 text-center text-gray-500">
        {{ t('notifications.empty') }}
      </div>

      <div v-else class="divide-y">
        <template v-for="(group, date) in groupedNotifications" :key="date">
          <!-- Date Header -->
          <div class="px-4 py-2 bg-gray-50">
            <p class="text-xs font-medium text-gray-500">{{ date }}</p>
          </div>

          <!-- Notifications in group -->
          <div
            v-for="notification in group"
            :key="notification.id"
            :class="[
              'p-4 hover:bg-gray-50 transition-colors cursor-pointer',
              { 'bg-blue-50': !notification.read },
            ]"
            @click="handleNotificationClick(notification)"
            :data-testid="`notification-${notification.id}`"
          >
            <div class="flex items-start gap-3">
              <!-- Icon -->
              <div :class="['p-2 rounded-lg', getNotificationStyles(notification.type).bg]">
                <component
                  :is="getNotificationIcon(notification.type)"
                  :class="['w-5 h-5', getNotificationStyles(notification.type).color]"
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
                @click="(event) => handleRemoveNotification(event, notification.id)"
                class="p-1 rounded-lg hover:bg-gray-200"
                :data-testid="`remove-notification-${notification.id}`"
              >
                <Close class="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-4 border-t bg-gray-50 rounded-b-lg">
      <button
        class="w-full text-center text-sm text-gray-600 hover:text-gray-900"
        @click="emit('close')"
        data-testid="close-notifications"
      >
        {{ t('common.close') }}
      </button>
    </div>
  </div>
</template>
