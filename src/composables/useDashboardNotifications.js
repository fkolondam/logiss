import { ref, computed, onMounted, onUnmounted } from 'vue'
import { differenceInDays, parseISO } from 'date-fns'
import { useDataSource } from '../stores/dataSource'
import { useDashboardState } from './useDashboardState'
import { useDashboardCache } from './useDashboardCache'

// Notification type definitions with metadata
export const NOTIFICATION_TYPES = {
  LOW_FUEL: {
    id: 'LOW_FUEL',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    icon: '⛽',
    priority: 'high',
    autoExpire: 24, // hours
  },
  MAINTENANCE_DUE: {
    id: 'MAINTENANCE_DUE',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: '🔧',
    priority: 'medium',
    autoExpire: 72,
  },
  DELIVERY_FAILED: {
    id: 'DELIVERY_FAILED',
    color: 'text-red-600',
    bg: 'bg-red-50',
    icon: '❌',
    priority: 'high',
    autoExpire: 48,
  },
  DELIVERY_SUCCESS: {
    id: 'DELIVERY_SUCCESS',
    color: 'text-green-600',
    bg: 'bg-green-50',
    icon: '✅',
    priority: 'low',
    autoExpire: 24,
  },
  ERROR: {
    id: 'ERROR',
    color: 'text-red-600',
    bg: 'bg-red-50',
    icon: '⚠️',
    priority: 'critical',
    autoExpire: null, // never auto-expire errors
  },
  SYSTEM: {
    id: 'SYSTEM',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    icon: '🔔',
    priority: 'medium',
    autoExpire: 48,
  },
}

const STORAGE_KEY = 'dashboard_notifications'
const MAX_NOTIFICATIONS = 50
const POLLING_INTERVAL = 30000 // 30 seconds
const NOTIFICATION_DEBOUNCE = 1000 // 1 second

export function useDashboardNotifications() {
  const notifications = ref([])
  const notificationSound = ref(null)
  const pollingInterval = ref(null)
  const dataSource = useDataSource()
  const { withLoadingState, handleError } = useDashboardState()
  const { getCached, setCached, CACHE_KEYS } = useDashboardCache()

  // Computed properties
  const unreadNotifications = computed(() => notifications.value.filter((n) => !n.read))

  const hasUnread = computed(() => unreadNotifications.value.length > 0)

  const notificationsByPriority = computed(() => {
    return notifications.value.reduce((acc, notification) => {
      const type = Object.values(NOTIFICATION_TYPES).find((t) => t.id === notification.type)
      const priority = type?.priority || 'low'
      if (!acc[priority]) acc[priority] = []
      acc[priority].push(notification)
      return acc
    }, {})
  })

  // Load notifications from localStorage with validation
  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed)) {
        console.warn('Invalid notifications format in storage')
        return
      }

      // Filter out expired notifications
      notifications.value = parsed.filter((notification) => {
        const type = Object.values(NOTIFICATION_TYPES).find((t) => t.id === notification.type)
        if (!type?.autoExpire) return true

        const expiryTime =
          new Date(notification.timestamp).getTime() + type.autoExpire * 60 * 60 * 1000
        return Date.now() < expiryTime
      })
    } catch (err) {
      handleError('notifications', err)
    }
  }

  // Save notifications to localStorage with retry
  const saveNotifications = async (retries = 3) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.value))
    } catch (err) {
      if (retries > 0) {
        // Remove oldest notifications and retry
        notifications.value = notifications.value.slice(-MAX_NOTIFICATIONS)
        await saveNotifications(retries - 1)
      } else {
        handleError('notifications', err)
      }
    }
  }

  // Initialize notification sound
  const initSound = () => {
    try {
      notificationSound.value = new Audio('/notification.mp3')
      // Preload audio
      notificationSound.value.load()
    } catch (err) {
      console.warn('Failed to initialize notification sound:', err)
    }
  }

  // Add notification with deduplication
  const addNotification = (notification) => {
    try {
      const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const type = Object.values(NOTIFICATION_TYPES).find((t) => t.id === notification.type)

      // Check for duplicate notifications
      const isDuplicate = notifications.value.some(
        (n) =>
          n.type === notification.type &&
          n.message === notification.message &&
          Date.now() - new Date(n.timestamp).getTime() < NOTIFICATION_DEBOUNCE,
      )

      if (isDuplicate) return null

      const newNotification = {
        id,
        timestamp: new Date().toISOString(),
        read: false,
        priority: type?.priority || 'low',
        ...notification,
      }

      // Add based on priority
      if (type?.priority === 'critical' || type?.priority === 'high') {
        notifications.value.unshift(newNotification)
      } else {
        notifications.value.push(newNotification)
      }

      // Limit total notifications
      if (notifications.value.length > MAX_NOTIFICATIONS) {
        notifications.value = notifications.value
          .sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
            return priorityOrder[a.priority] - priorityOrder[b.priority]
          })
          .slice(0, MAX_NOTIFICATIONS)
      }

      // Play sound if enabled and notification is high priority
      if (notificationSound.value && (type?.priority === 'critical' || type?.priority === 'high')) {
        notificationSound.value.play().catch(() => {})
      }

      saveNotifications()
      return id
    } catch (err) {
      handleError('notifications', err)
      return null
    }
  }

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const notification = notifications.value.find((n) => n.id === id)
      if (notification) {
        notification.read = true
        await saveNotifications()
      }
    } catch (err) {
      handleError('notifications', err)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      notifications.value.forEach((n) => (n.read = true))
      await saveNotifications()
    } catch (err) {
      handleError('notifications', err)
    }
  }

  // Remove notification
  const removeNotification = async (id) => {
    try {
      const index = notifications.value.findIndex((n) => n.id === id)
      if (index !== -1) {
        notifications.value.splice(index, 1)
        await saveNotifications()
      }
    } catch (err) {
      handleError('notifications', err)
    }
  }

  // Clear all notifications
  const clearNotifications = async () => {
    try {
      notifications.value = []
      await saveNotifications()
    } catch (err) {
      handleError('notifications', err)
    }
  }

  // Check vehicle notifications with improved validation
  const checkVehicleNotifications = (vehicles) => {
    if (!Array.isArray(vehicles)) return

    vehicles.forEach((vehicle) => {
      // Fuel level check
      if (typeof vehicle.fuelLevel === 'number' && vehicle.fuelLevel < 20) {
        addNotification({
          type: NOTIFICATION_TYPES.LOW_FUEL.id,
          title: 'Low Fuel Alert',
          message: `Vehicle ${vehicle.plateNumber} is running low on fuel (${vehicle.fuelLevel}%)`,
          data: { vehicleId: vehicle.id },
        })
      }

      // Maintenance check
      if (vehicle.nextServiceDue) {
        try {
          const daysToMaintenance = differenceInDays(parseISO(vehicle.nextServiceDue), new Date())

          if (daysToMaintenance <= 7 && daysToMaintenance > 0) {
            addNotification({
              type: NOTIFICATION_TYPES.MAINTENANCE_DUE.id,
              title: 'Maintenance Due Soon',
              message: `Vehicle ${vehicle.plateNumber} is due for maintenance in ${daysToMaintenance} days`,
              data: { vehicleId: vehicle.id },
            })
          }
        } catch (err) {
          console.warn('Invalid nextServiceDue date:', err)
        }
      }

      // Status check
      if (vehicle.status === 'BREAKDOWN') {
        addNotification({
          type: NOTIFICATION_TYPES.ERROR.id,
          title: 'Vehicle Breakdown',
          message: `Vehicle ${vehicle.plateNumber} has reported a breakdown`,
          data: { vehicleId: vehicle.id },
        })
      }
    })
  }

  // Check delivery notifications with improved validation
  const checkDeliveryNotifications = (deliveries) => {
    if (!Array.isArray(deliveries)) return

    deliveries.forEach((delivery) => {
      if (!delivery.status) return

      // Failed delivery check
      if (delivery.status.startsWith('BATAL')) {
        addNotification({
          type: NOTIFICATION_TYPES.DELIVERY_FAILED.id,
          title: 'Delivery Failed',
          message: `Delivery #${delivery.id} has failed: ${delivery.status}`,
          data: { deliveryId: delivery.id },
        })
      }

      // Successful delivery check
      if (delivery.status === 'DITERIMA - SEMUA' && !delivery.notified) {
        addNotification({
          type: NOTIFICATION_TYPES.DELIVERY_SUCCESS.id,
          title: 'Delivery Completed',
          message: `Delivery #${delivery.id} has been completed successfully`,
          data: { deliveryId: delivery.id },
        })
      }

      // Delayed delivery check
      if (delivery.status === 'TERLAMBAT') {
        addNotification({
          type: NOTIFICATION_TYPES.SYSTEM.id,
          title: 'Delivery Delayed',
          message: `Delivery #${delivery.id} is experiencing delays`,
          data: { deliveryId: delivery.id },
        })
      }
    })
  }

  // Start polling with error handling and backoff
  const startPolling = (retryCount = 0) => {
    stopPolling()

    const poll = async () => {
      try {
        const provider = await dataSource.getProvider()
        const newNotifications = await withLoadingState('notifications', () =>
          provider.fetch('notifications', { limit: MAX_NOTIFICATIONS }),
        )

        if (Array.isArray(newNotifications)) {
          newNotifications.forEach((notification) => {
            if (
              !notifications.value.some(
                (n) =>
                  n.timestamp === notification.timestamp &&
                  n.type === notification.type &&
                  n.message === notification.message,
              )
            ) {
              addNotification(notification)
            }
          })
        }

        // Reset retry count on success
        retryCount = 0
      } catch (err) {
        console.warn('Polling error:', err)
        retryCount++

        // Exponential backoff
        if (retryCount > 3) {
          const backoffTime = Math.min(1000 * Math.pow(2, retryCount - 3), 30000)
          await new Promise((resolve) => setTimeout(resolve, backoffTime))
        }
      }
    }

    pollingInterval.value = setInterval(poll, POLLING_INTERVAL)
    poll() // Initial poll
  }

  // Stop polling
  const stopPolling = () => {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }
  }

  // Initialize
  onMounted(() => {
    loadNotifications()
    initSound()
    startPolling()
  })

  // Cleanup
  onUnmounted(() => {
    stopPolling()
  })

  return {
    notifications,
    unreadNotifications,
    hasUnread,
    notificationsByPriority,
    NOTIFICATION_TYPES,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    checkVehicleNotifications,
    checkDeliveryNotifications,
  }
}
