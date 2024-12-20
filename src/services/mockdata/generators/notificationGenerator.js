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
  const notifications = []
  const timestamp = getRandomTimeInWorkingHours(date)

  // Low fuel notification (20% chance)
  if (vehicle.fuelLevel < 20 && Math.random() < 0.2) {
    notifications.push(
      generateNotification(
        'LOW_FUEL',
        {
          vehicleId: vehicle.id,
          details: `${vehicle.plateNumber} (${vehicle.fuelLevel}%)`,
        },
        timestamp,
      ),
    )
  }

  // Maintenance notification (30% chance if maintenance is due)
  if (vehicle.nextServiceDue && Math.random() < 0.3) {
    const daysToService = Math.floor(
      (new Date(vehicle.nextServiceDue) - date) / (1000 * 60 * 60 * 24),
    )
    if (daysToService <= 7) {
      notifications.push(
        generateNotification(
          'MAINTENANCE_DUE',
          {
            vehicleId: vehicle.id,
            details: `${vehicle.plateNumber} (${daysToService} days remaining)`,
          },
          timestamp,
        ),
      )
    }
  }

  // Breakdown notification (5% chance)
  if (Math.random() < 0.05) {
    notifications.push(
      generateNotification(
        'ERROR',
        {
          vehicleId: vehicle.id,
          details: `${vehicle.plateNumber} reported breakdown`,
        },
        timestamp,
      ),
    )
  }

  return notifications
}

// Generate delivery-related notifications
const generateDeliveryNotifications = (delivery, date) => {
  const notifications = []
  const timestamp = getRandomTimeInWorkingHours(date)

  // Failed delivery notification
  if (delivery.status.startsWith('BATAL')) {
    notifications.push(
      generateNotification(
        'DELIVERY_FAILED',
        {
          deliveryId: delivery.id,
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
          deliveryId: delivery.id,
          details: `Order #${delivery.id}`,
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
          deliveryId: delivery.id,
          details: `Order #${delivery.id} experiencing delays`,
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
  const timestamp = getRandomTimeInWorkingHours(date)

  for (let i = 0; i < count; i++) {
    notifications.push(
      generateNotification(
        'SYSTEM',
        {
          details: `System update ${formatDate(date)}`,
        },
        timestamp,
      ),
    )
  }

  return notifications
}

// Generate a batch of test notifications
const generateTestNotifications = (vehicles, deliveries, date = new Date()) => {
  let notifications = []

  // Generate vehicle notifications
  vehicles.forEach((vehicle) => {
    notifications = notifications.concat(generateVehicleNotifications(vehicle, date))
  })

  // Generate delivery notifications
  deliveries.forEach((delivery) => {
    notifications = notifications.concat(generateDeliveryNotifications(delivery, date))
  })

  // Add some system notifications
  notifications = notifications.concat(generateSystemNotifications(date, getRandomNumber(1, 3)))

  // Sort by timestamp
  notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return notifications
}

export {
  generateNotification,
  generateVehicleNotifications,
  generateDeliveryNotifications,
  generateSystemNotifications,
  generateTestNotifications,
}
