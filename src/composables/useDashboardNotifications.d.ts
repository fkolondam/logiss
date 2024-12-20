import type { Ref, ComputedRef } from 'vue'

export interface Vehicle {
  id: string
  plateNumber: string
  fuelLevel: number
  nextServiceDue?: string
  status: string
}

export interface Delivery {
  id: string
  status: string
  notified?: boolean
}

export interface NotificationType {
  id: string
  color: string
  bg: string
  icon: string
}

export interface NotificationData {
  vehicleId?: string
  deliveryId?: string
  error?: string
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  timestamp: string
  read: boolean
  data?: NotificationData
}

export interface NotificationError {
  message: string
  details?: string
}

export interface NotificationTypes {
  [key: string]: NotificationType
}

export interface UseDashboardNotifications {
  notifications: Ref<Notification[]>
  unreadNotifications: ComputedRef<Notification[]>
  hasUnread: ComputedRef<boolean>
  notificationsByType: ComputedRef<Record<string, Notification[]>>
  error: Ref<NotificationError | null>
  NOTIFICATION_TYPES: NotificationTypes
  initSound: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string | null
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  checkVehicleNotifications: (vehicles: Vehicle[]) => void
  checkDeliveryNotifications: (deliveries: Delivery[]) => void
}

export function useDashboardNotifications(): UseDashboardNotifications
