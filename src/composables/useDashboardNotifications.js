import { ref, computed } from 'vue'

export const useDashboardNotifications = () => {
  const notifications = ref([])
  const lastChecked = ref(Date.now())

  // Notification types and their configurations
  const NOTIFICATION_TYPES = {
    LOW_FUEL: {
      type: 'warning',
      icon: 'Fuel',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    MAINTENANCE_DUE: {
      type: 'info',
      icon: 'Wrench',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    DELIVERY_FAILED: {
      type: 'error',
      icon: 'AlertTriangle',
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    DELIVERY_SUCCESS: {
      type: 'success',
      icon: 'CheckCircle',
      color: 'text-green-600',
      bg: 'bg-green-50'
    }
  }

  // Add a new notification
  const addNotification = (notification) => {
    const id = Date.now()
    notifications.value.unshift({
      id,
      timestamp: new Date(),
      read: false,
      ...notification,
      ...NOTIFICATION_TYPES[notification.type]
    })

    // Keep only last 50 notifications
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
  }

  // Mark notification as read
  const markAsRead = (notificationId) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  // Mark all as read
  const markAllAsRead = () => {
    notifications.value.forEach(notification => {
      notification.read = true
    })
    lastChecked.value = Date.now()
  }

  // Remove a notification
  const removeNotification = (notificationId) => {
    notifications.value = notifications.value.filter(n => n.id !== notificationId)
  }

  // Clear all notifications
  const clearNotifications = () => {
    notifications.value = []
  }

  // Get unread notifications
  const unreadNotifications = computed(() => {
    return notifications.value.filter(n => !n.read)
  })

  // Check for vehicle-related notifications
  const checkVehicleNotifications = (vehicles) => {
    vehicles.forEach(vehicle => {
      // Check fuel level
      if (vehicle.fuelLevel < 30) {
        addNotification({
          type: 'LOW_FUEL',
          title: 'Low Fuel Alert',
          message: `Vehicle ${vehicle.plateNumber} is running low on fuel (${vehicle.fuelLevel}%)`,
          data: { vehicleId: vehicle.id }
        })
      }

      // Check maintenance schedule
      const nextService = new Date(vehicle.nextServiceDue)
      const daysUntilService = Math.ceil((nextService - new Date()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilService <= 7 && daysUntilService > 0) {
        addNotification({
          type: 'MAINTENANCE_DUE',
          title: 'Maintenance Reminder',
          message: `Vehicle ${vehicle.plateNumber} is due for maintenance in ${daysUntilService} days`,
          data: { vehicleId: vehicle.id }
        })
      }
    })
  }

  // Check for delivery-related notifications
  const checkDeliveryNotifications = (deliveries) => {
    deliveries.forEach(delivery => {
      const status = delivery.status.toLowerCase()
      
      if (status.includes('batal')) {
        addNotification({
          type: 'DELIVERY_FAILED',
          title: 'Delivery Failed',
          message: `Delivery #${delivery.invoice} was cancelled: ${status}`,
          data: { deliveryId: delivery.id }
        })
      } else if (status === 'diterima - semua') {
        addNotification({
          type: 'DELIVERY_SUCCESS',
          title: 'Delivery Completed',
          message: `Delivery #${delivery.invoice} was successfully completed`,
          data: { deliveryId: delivery.id }
        })
      }
    })
  }

  return {
    notifications,
    unreadNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    checkVehicleNotifications,
    checkDeliveryNotifications,
    NOTIFICATION_TYPES
  }
}
