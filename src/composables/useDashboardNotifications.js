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

export function useDashboardNotifications() {
  const notifications = ref([])
  const notificationSound = ref(null)
  const error = ref(null)
  const pollingInterval = ref(null)
  const dataSource = useDataSource()

  // Computed properties
  const unreadNotifications = computed(() => notifications.value.filter((n) => !n.read))
  const hasUnread = computed(() => unreadNotifications.value.length > 0)
  const notificationsByType = computed(() => {
    return notifications.value.reduce((acc, notification) => {
      if (!acc[notification.type]) {
        acc[notification.type] = []
      }
      acc[notification.type].push(notification)
      return acc
    }, {})
  })

  // Load notifications from localStorage
  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        notifications.value = JSON.parse(stored)
      }
    } catch (err) {
      handleError('Failed to load notifications', err)
    }
  }

  // Save notifications to localStorage
  const saveNotifications = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.value))
    } catch (err) {
      handleError('Failed to save notifications', err)
    }
  }

  // Initialize notification sound
  const initSound = () => {
    try {
      notificationSound.value = new Audio('/notification.mp3')
    } catch (err) {
      handleError('Failed to initialize notification sound', err)
    }
  }

  // Handle errors
  const handleError = (message, err = null) => {
    error.value = { message, details: err?.message }
    console.error(message, err)

    // Add error notification
    addNotification({
      type: NOTIFICATION_TYPES.ERROR.id,
      title: 'System Error',
      message: message,
      data: { error: err?.message },
    })
  }

  // Add notification
  const addNotification = (notification) => {
    try {
      const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Add new notification at the start
      notifications.value.unshift({
        id,
        timestamp: new Date().toISOString(),
        read: false,
        ...notification,
      })

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
      handleError('Failed to add notification', err)
      return null
    }
  }

  // Mark notification as read
  const markAsRead = (id) => {
    try {
      const notification = notifications.value.find((n) => n.id === id)
      if (notification) {
        notification.read = true
        saveNotifications()
      }
    } catch (err) {
      handleError('Failed to mark notification as read', err)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    try {
      notifications.value.forEach((n) => (n.read = true))
      saveNotifications()
    } catch (err) {
      handleError('Failed to mark all notifications as read', err)
    }
  }

  // Remove notification
  const removeNotification = (id) => {
    try {
      const index = notifications.value.findIndex((n) => n.id === id)
      if (index !== -1) {
        notifications.value.splice(index, 1)
        saveNotifications()
      }
    } catch (err) {
      handleError('Failed to remove notification', err)
    }
  }

  // Clear all notifications
  const clearNotifications = () => {
    try {
      notifications.value = []
      saveNotifications()
    } catch (err) {
      handleError('Failed to clear notifications', err)
    }
  }

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
        newNotifications.forEach((notification) => {
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
      handleError('Failed to fetch notifications', err)

      // Add system notification for persistent failures
      if (
        !notifications.value.some(
          (n) =>
            n.type === NOTIFICATION_TYPES.ERROR.id && n.message.includes('notification service'),
        )
      ) {
        addNotification({
          type: NOTIFICATION_TYPES.ERROR.id,
          title: 'Notification Service Error',
          message: 'Unable to fetch new notifications. Please check your connection.',
          data: { error: err?.message },
        })
      }
    }
  }

  // Start polling for new notifications
  const startPolling = () => {
    stopPolling() // Clear any existing interval
    pollingInterval.value = setInterval(fetchNotifications, POLLING_INTERVAL)
  }

  // Stop polling for new notifications
  const stopPolling = () => {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }
  }

  // Check vehicle notifications
  const checkVehicleNotifications = (vehicles) => {
    if (!vehicles) return

    try {
      vehicles.forEach((vehicle) => {
        // Check fuel level
        if (vehicle.fuelLevel < 20) {
          addNotification({
            type: NOTIFICATION_TYPES.LOW_FUEL.id,
            title: 'Low Fuel Alert',
            message: `Vehicle ${vehicle.plateNumber} is running low on fuel (${vehicle.fuelLevel}%)`,
            data: { vehicleId: vehicle.id },
          })
        }

        // Check maintenance using nextServiceDue field
        if (vehicle.nextServiceDue) {
          const daysToMaintenance = differenceInDays(parseISO(vehicle.nextServiceDue), new Date())

          if (daysToMaintenance <= 7 && daysToMaintenance > 0) {
            addNotification({
              type: NOTIFICATION_TYPES.MAINTENANCE_DUE.id,
              title: 'Maintenance Due Soon',
              message: `Vehicle ${vehicle.plateNumber} is due for maintenance in ${daysToMaintenance} days`,
              data: { vehicleId: vehicle.id },
            })
          }
        }

        // Check vehicle status
        if (vehicle.status === 'BREAKDOWN') {
          addNotification({
            type: NOTIFICATION_TYPES.ERROR.id,
            title: 'Vehicle Breakdown',
            message: `Vehicle ${vehicle.plateNumber} has reported a breakdown`,
            data: { vehicleId: vehicle.id },
          })
        }
      })
    } catch (err) {
      handleError('Failed to check vehicle notifications', err)
    }
  }

  // Check delivery notifications
  const checkDeliveryNotifications = (deliveries) => {
    if (!deliveries) return

    try {
      deliveries.forEach((delivery) => {
        // Check for failed deliveries (any BATAL status)
        if (delivery.status.startsWith('BATAL')) {
          addNotification({
            type: NOTIFICATION_TYPES.DELIVERY_FAILED.id,
            title: 'Delivery Failed',
            message: `Delivery #${delivery.id} has failed: ${delivery.status}`,
            data: { deliveryId: delivery.id },
          })
        }

        // Check for completed deliveries
        if (delivery.status === 'DITERIMA - SEMUA' && !delivery.notified) {
          addNotification({
            type: NOTIFICATION_TYPES.DELIVERY_SUCCESS.id,
            title: 'Delivery Completed',
            message: `Delivery #${delivery.id} has been completed successfully`,
            data: { deliveryId: delivery.id },
          })
        }

        // Check for delayed deliveries
        if (delivery.status === 'TERLAMBAT') {
          addNotification({
            type: NOTIFICATION_TYPES.SYSTEM.id,
            title: 'Delivery Delayed',
            message: `Delivery #${delivery.id} is experiencing delays`,
            data: { deliveryId: delivery.id },
          })
        }
      })
    } catch (err) {
      handleError('Failed to check delivery notifications', err)
    }
  }

  // Initialize on mount
  onMounted(() => {
    loadNotifications()
    initSound()
    fetchNotifications()
    startPolling()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    stopPolling()
  })

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
    checkVehicleNotifications,
    checkDeliveryNotifications,
  }
}