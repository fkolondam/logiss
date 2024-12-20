import { ref, computed, onMounted, onUnmounted } from 'vue'
import { differenceInDays, parseISO } from 'date-fns'
import { useDataSource } from '../stores/dataSource'

export const NOTIFICATION_TYPES = {
  LOW_FUEL: {
    id: 'LOW_FUEL',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    icon: '⛽',
  },
  MAINTENANCE_DUE: {
    id: 'MAINTENANCE_DUE',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: '🔧',
  },
  DELIVERY_FAILED: {
    id: 'DELIVERY_FAILED',
    color: 'text-red-600',
    bg: 'bg-red-50',
    icon: '❌',
  },
  DELIVERY_SUCCESS: {
    id: 'DELIVERY_SUCCESS',
    color: 'text-green-600',
    bg: 'bg-green-50',
    icon: '✅',
  },
  ERROR: {
    id: 'ERROR',
    color: 'text-red-600',
    bg: 'bg-red-50',
    icon: '⚠️',
  },
  SYSTEM: {
    id: 'SYSTEM',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    icon: '🔔',
  },
}

const STORAGE_KEY = 'dashboard_notifications'
const MAX_NOTIFICATIONS = 50
const POLLING_INTERVAL = 30000 // 30 seconds

export type NotificationTypes = typeof NOTIFICATION_TYPES
export type NotificationType = keyof NotificationTypes

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  data?: Record<string, any>
}

export function useDashboardNotifications() {
  const notifications = ref<Notification[]>([])
  const notificationSound = ref<HTMLAudioElement | null>(null)
  const error = ref<{ message: string; details?: string } | null>(null)
  const pollingInterval = ref<number | null>(null)
  const dataSource = useDataSource()

  // Computed properties
  const unreadNotifications = computed(() => notifications.value.filter((n) => !n.read))
  const hasUnread = computed(() => unreadNotifications.value.length > 0)
  const notificationsByType = computed(() => {
    return notifications.value.reduce(
      (acc, notification) => {
        if (!acc[notification.type]) {
          acc[notification.type] = []
        }
        acc[notification.type].push(notification)
        return acc
      },
      {} as Record<NotificationType, Notification[]>,
    )
  })

  // Load notifications from localStorage
  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        notifications.value = JSON.parse(stored)
      }
    } catch (err) {
      handleError('Failed to load notifications', err as Error)
    }
  }

  // Save notifications to localStorage
  const saveNotifications = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.value))
    } catch (err) {
      handleError('Failed to save notifications', err as Error)
    }
  }

  // Initialize notification sound
  const initSound = () => {
    try {
      notificationSound.value = new Audio('/notification.mp3')
    } catch (err) {
      handleError('Failed to initialize notification sound', err as Error)
    }
  }

  // Handle errors
  const handleError = (message: string, err: Error | null = null) => {
    error.value = { message, details: err?.message }
    console.error(message, err)

    // Add error notification
    addNotification({
      type: 'ERROR',
      title: 'System Error',
      message: message,
      data: { error: err?.message },
    })
  }

  // Add notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    try {
      const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Add new notification at the start
      notifications.value.unshift({
        id,
        timestamp: new Date().toISOString(),
        read: false,
        ...notification,
      } as Notification)

      // Limit total notifications
      if (notifications.value.length > MAX_NOTIFICATIONS) {
        notifications.value = notifications.value.slice(0, MAX_NOTIFICATIONS)
      }

      // Play sound if enabled
      if (notificationSound.value) {
        notificationSound.value.play().catch(() => {
          // Ignore audio play errors
        })
      }

      // Save to localStorage
      saveNotifications()

      return id
    } catch (err) {
      handleError('Failed to add notification', err as Error)
      return null
    }
  }

  // Mark notification as read
  const markAsRead = (id: string) => {
    try {
      const notification = notifications.value.find((n) => n.id === id)
      if (notification) {
        notification.read = true
        saveNotifications()
      }
    } catch (err) {
      handleError('Failed to mark notification as read', err as Error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    try {
      notifications.value.forEach((n) => (n.read = true))
      saveNotifications()
    } catch (err) {
      handleError('Failed to mark all notifications as read', err as Error)
    }
  }

  // Remove notification
  const removeNotification = (id: string) => {
    try {
      const index = notifications.value.findIndex((n) => n.id === id)
      if (index !== -1) {
        notifications.value.splice(index, 1)
        saveNotifications()
      }
    } catch (err) {
      handleError('Failed to remove notification', err as Error)
    }
  }

  // Clear all notifications
  const clearNotifications = () => {
    try {
      notifications.value = []
      saveNotifications()
    } catch (err) {
      handleError('Failed to clear notifications', err as Error)
    }
  }

  // Load notifications immediately
  loadNotifications()

  // Initialize on mount
  onMounted(() => {
    initSound()
    fetchNotifications()
    startPolling()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    stopPolling()
  })

  // Fetch notifications from data provider
  const fetchNotifications = async () => {
    try {
      const provider = await dataSource.getProvider()

      // Add retry mechanism for network failures
      let retries = 3
      let newNotifications

      while (retries > 0) {
        try {
          newNotifications = await provider.fetch('notifications', {
            limit: MAX_NOTIFICATIONS,
          })
          break
        } catch (fetchError) {
          retries--
          if (retries === 0) throw fetchError
          await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1s before retry
        }
      }

      // Add any new notifications that don't exist yet
      if (newNotifications) {
        newNotifications.forEach((notification: Notification) => {
          // Check for duplicates with more robust comparison
          const isDuplicate = notifications.value.some(
            (n) =>
              n.timestamp === notification.timestamp &&
              n.type === notification.type &&
              n.message === notification.message &&
              JSON.stringify(n.data) === JSON.stringify(notification.data),
          )

          if (!isDuplicate) {
            addNotification(notification)
          }
        })
      }
    } catch (err) {
      handleError('Failed to fetch notifications', err as Error)

      // Add system notification for persistent failures
      if (
        !notifications.value.some(
          (n) => n.type === 'ERROR' && n.message.includes('notification service'),
        )
      ) {
        addNotification({
          type: 'ERROR',
          title: 'Notification Service Error',
          message: 'Unable to fetch new notifications. Please check your connection.',
          data: { error: (err as Error)?.message },
        })
      }
    }
  }

  // Start polling for new notifications
  const startPolling = () => {
    stopPolling() // Clear any existing interval
    pollingInterval.value = window.setInterval(fetchNotifications, POLLING_INTERVAL)
  }

  // Stop polling for new notifications
  const stopPolling = () => {
    if (pollingInterval.value) {
      window.clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }
  }

  return {
    // State
    notifications,
    unreadNotifications,
    hasUnread,
    notificationsByType,
    error,
    NOTIFICATION_TYPES,

    // Methods
    initSound,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
  }
}
