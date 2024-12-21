import { getRandomNumber, getRandomItem } from './randomUtils'
import { formatDate, getRandomTimeInWorkingHours } from './dateUtils'

// Sample notification messages
const NOTIFICATION_MESSAGES = {
  LOW_FUEL: ['Running low on fuel', 'Fuel level critical', 'Please refuel soon'],
  MAINTENANCE_DUE: [
    'Scheduled maintenance required',
    'Service check due',
    'Maintenance deadline approaching',
  ],
  DELIVERY_FAILED: [
    'Delivery attempt unsuccessful',
    'Unable to complete delivery',
    'Delivery failed - recipient unavailable',
  ],
  DELIVERY_SUCCESS: [
    'Delivery completed successfully',
    'Package delivered',
    'Successful delivery confirmed',
  ],
  ERROR: ['System error encountered', 'Operation failed', 'Technical issue detected'],
  SYSTEM: ['System update required', 'New feature available', 'Important system notice'],
}

// Generate a random notification
const generateNotification = (type, data = {}, timestamp = null) => {
  const messages = NOTIFICATION_MESSAGES[type] || NOTIFICATION_MESSAGES.SYSTEM
  const message = getRandomItem(messages)

  return {
    type,
    title: type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' '),
    message: message + (data.details ? `: ${data.details}` : ''),
    timestamp: timestamp || new Date().toISOString(),
    data,
  }
}

// Generate vehicle-related notifications
const generateVehicleNotifications = (vehicle, date) => {
  if (!vehicle || typeof vehicle !== 'object') return []

  const notifications = []
  const timestamp = getRandomTimeInWorkingHours(date || new Date())

  // Low fuel notification (20% chance)
  if (typeof vehicle.fuelLevel === 'number' && vehicle.fuelLevel < 20 && Math.random() < 0.2) {
    notifications.push(
      generateNotification(
        'LOW_FUEL',
        {
          vehicleId: vehicle.id || 'unknown',
          details: `${vehicle.plateNumber || 'Unknown Vehicle'} (${vehicle.fuelLevel}%)`,
        },
        timestamp,
      ),
    )
  }

  // Maintenance notification (30% chance if maintenance is due)
  if (vehicle.nextServiceDue && Math.random() < 0.3) {
    try {
      const daysToService = Math.floor(
        (new Date(vehicle.nextServiceDue) - (date || new Date())) / (1000 * 60 * 60 * 24),
      )
      if (daysToService <= 7) {
        notifications.push(
          generateNotification(
            'MAINTENANCE_DUE',
            {
              vehicleId: vehicle.id || 'unknown',
              details: `${vehicle.plateNumber || 'Unknown Vehicle'} (${daysToService} days remaining)`,
            },
            timestamp,
          ),
        )
      }
    } catch (err) {
      console.warn('Invalid nextServiceDue date:', err)
    }
  }

  // Breakdown notification (5% chance)
  if (Math.random() < 0.05) {
    notifications.push(
      generateNotification(
        'ERROR',
        {
          vehicleId: vehicle.id || 'unknown',
          details: `${vehicle.plateNumber || 'Unknown Vehicle'} reported breakdown`,
        },
        timestamp,
      ),
    )
  }

  return notifications
}

// Generate delivery-related notifications
const generateDeliveryNotifications = (delivery, date) => {
  if (!delivery || typeof delivery !== 'object') return []

  const notifications = []
  const timestamp = getRandomTimeInWorkingHours(date || new Date())

  // Failed delivery notification
  if (delivery.status && delivery.status.startsWith('BATAL')) {
    notifications.push(
      generateNotification(
        'DELIVERY_FAILED',
        {
          deliveryId: delivery.id || 'unknown',
          details: delivery.status,
        },
        timestamp,
      ),
    )
  }

  // Successful delivery notification
  if (delivery.status === 'DITERIMA - SEMUA') {
    notifications.push(
      generateNotification(
        'DELIVERY_SUCCESS',
        {
          deliveryId: delivery.id || 'unknown',
          details: `Order #${delivery.id || 'unknown'}`,
        },
        timestamp,
      ),
    )
  }

  // Delayed delivery notification (10% chance)
  if (Math.random() < 0.1) {
    notifications.push(
      generateNotification(
        'SYSTEM',
        {
          deliveryId: delivery.id || 'unknown',
          details: `Order #${delivery.id || 'unknown'} experiencing delays`,
        },
        timestamp,
      ),
    )
  }

  return notifications
}

// Generate system notifications
const generateSystemNotifications = (date, count = 1) => {
  const notifications = []
  const timestamp = getRandomTimeInWorkingHours(date || new Date())
  const safeCount = Math.max(1, Math.min(count || 1, 10)) // Ensure count is between 1 and 10

  for (let i = 0; i < safeCount; i++) {
    notifications.push(
      generateNotification(
        'SYSTEM',
        {
          details: `System update ${formatDate(date || new Date())}`,
        },
        timestamp,
      ),
    )
  }

  return notifications
}

// Generate a batch of test notifications
const generateTestNotifications = (vehicles = [], deliveries = [], date = new Date()) => {
  let notifications = []

  // Ensure inputs are arrays
  const safeVehicles = Array.isArray(vehicles) ? vehicles : []
  const safeDeliveries = Array.isArray(deliveries) ? deliveries : []
  const safeDate = date instanceof Date ? date : new Date()

  // Generate vehicle notifications
  safeVehicles.forEach((vehicle) => {
    if (vehicle && typeof vehicle === 'object') {
      notifications = notifications.concat(generateVehicleNotifications(vehicle, safeDate))
    }
  })

  // Generate delivery notifications
  safeDeliveries.forEach((delivery) => {
    if (delivery && typeof delivery === 'object') {
      notifications = notifications.concat(generateDeliveryNotifications(delivery, safeDate))
    }
  })

  // Add some system notifications
  notifications = notifications.concat(generateSystemNotifications(safeDate, getRandomNumber(1, 3)))

  // Sort by timestamp and ensure unique IDs
  notifications = notifications
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map((notification, index) => ({
      ...notification,
      id: `notif_${Date.now()}_${index}`,
    }))

  return notifications
}

export {
  generateNotification,
  generateVehicleNotifications,
  generateDeliveryNotifications,
  generateSystemNotifications,
  generateTestNotifications,
}
