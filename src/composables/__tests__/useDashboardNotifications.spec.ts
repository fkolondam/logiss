import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useDashboardNotifications, NOTIFICATION_TYPES } from '../useDashboardNotifications'
import { useDataSource } from '../../stores/dataSource'

// Mock the dataSource store
vi.mock('../../stores/dataSource', () => ({
  useDataSource: vi.fn(),
}))

interface MockStorage {
  [key: string]: string
}

// Mock localStorage
const localStorageMock = (() => {
  let store: MockStorage = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock Audio
class AudioMock {
  src: string
  constructor(url: string) {
    this.src = url
  }
  play(): Promise<void> {
    return Promise.resolve()
  }
}
// Use type assertion for global Audio mock
global.Audio = AudioMock as unknown as typeof Audio

describe('useDashboardNotifications', () => {
  const mockProvider = {
    fetch: vi.fn(),
    markNotificationAsRead: vi.fn(),
    markAllNotificationsAsRead: vi.fn(),
  }

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    localStorageMock.clear()

    // Setup mock provider
    vi.mocked(useDataSource).mockImplementation(() => ({
      getProvider: () => Promise.resolve(mockProvider),
    }))

    // Setup mock notifications
    mockProvider.fetch.mockResolvedValue([
      {
        id: '1',
        type: NOTIFICATION_TYPES.LOW_FUEL.id,
        title: 'Low Fuel Alert',
        message: 'Vehicle ABC123 is low on fuel',
        timestamp: new Date().toISOString(),
        read: false,
        data: { vehicleId: 'v1' },
      },
      {
        id: '2',
        type: NOTIFICATION_TYPES.DELIVERY_SUCCESS.id,
        title: 'Delivery Complete',
        message: 'Delivery #123 completed',
        timestamp: new Date().toISOString(),
        read: true,
        data: { deliveryId: 'd1' },
      },
    ])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with empty notifications', () => {
    const { notifications } = useDashboardNotifications()
    expect(notifications.value).toEqual([])
  })

  it('loads notifications from localStorage', () => {
    const storedNotifications = [
      {
        id: '1',
        type: NOTIFICATION_TYPES.SYSTEM.id,
        title: 'Test',
        message: 'Test message',
        timestamp: new Date().toISOString(),
        read: false,
      },
    ]
    localStorageMock.setItem('dashboard_notifications', JSON.stringify(storedNotifications))

    const { notifications } = useDashboardNotifications()
    expect(notifications.value).toEqual(storedNotifications)
  })

  it('adds new notification', () => {
    const { notifications, addNotification } = useDashboardNotifications()

    const notification = {
      type: NOTIFICATION_TYPES.ERROR.id,
      title: 'Error',
      message: 'Test error',
    }

    const id = addNotification(notification)
    expect(id).toBeTruthy()
    expect(notifications.value[0]).toMatchObject({
      ...notification,
      id: expect.any(String),
      timestamp: expect.any(String),
      read: false,
    })
  })

  it('marks notification as read', () => {
    const { notifications, addNotification, markAsRead } = useDashboardNotifications()

    const notification = {
      type: NOTIFICATION_TYPES.SYSTEM.id,
      title: 'Test',
      message: 'Test message',
    }

    const id = addNotification(notification)
    expect(notifications.value[0].read).toBe(false)

    markAsRead(id!)
    expect(notifications.value[0].read).toBe(true)
  })

  it('marks all notifications as read', () => {
    const { notifications, addNotification, markAllAsRead } = useDashboardNotifications()

    // Add multiple notifications
    addNotification({
      type: NOTIFICATION_TYPES.SYSTEM.id,
      title: 'Test 1',
      message: 'Test message 1',
    })
    addNotification({
      type: NOTIFICATION_TYPES.ERROR.id,
      title: 'Test 2',
      message: 'Test message 2',
    })

    markAllAsRead()
    expect(notifications.value.every((n) => n.read)).toBe(true)
  })

  it('removes notification', () => {
    const { notifications, addNotification, removeNotification } = useDashboardNotifications()

    const notification = {
      type: NOTIFICATION_TYPES.SYSTEM.id,
      title: 'Test',
      message: 'Test message',
    }

    const id = addNotification(notification)
    expect(notifications.value).toHaveLength(1)

    removeNotification(id!)
    expect(notifications.value).toHaveLength(0)
  })

  it('clears all notifications', () => {
    const { notifications, addNotification, clearNotifications } = useDashboardNotifications()

    // Add multiple notifications
    addNotification({
      type: NOTIFICATION_TYPES.SYSTEM.id,
      title: 'Test 1',
      message: 'Test message 1',
    })
    addNotification({
      type: NOTIFICATION_TYPES.ERROR.id,
      title: 'Test 2',
      message: 'Test message 2',
    })

    expect(notifications.value).toHaveLength(2)
    clearNotifications()
    expect(notifications.value).toHaveLength(0)
  })

  it('checks vehicle notifications', () => {
    const { notifications, checkVehicleNotifications } = useDashboardNotifications()

    const vehicles = [
      {
        id: 'v1',
        plateNumber: 'ABC123',
        fuelLevel: 15,
        nextServiceDue: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE',
      },
    ]

    checkVehicleNotifications(vehicles)
    expect(notifications.value).toHaveLength(2) // Low fuel + maintenance due
  })

  it('checks delivery notifications', () => {
    const { notifications, checkDeliveryNotifications } = useDashboardNotifications()

    const deliveries = [
      {
        id: 'd1',
        status: 'BATAL - ALAMAT',
        notified: false,
      },
      {
        id: 'd2',
        status: 'DITERIMA - SEMUA',
        notified: false,
      },
    ]

    checkDeliveryNotifications(deliveries)
    expect(notifications.value).toHaveLength(2) // Failed + success
  })

  it('handles errors gracefully', () => {
    const { error, addNotification } = useDashboardNotifications()

    // Mock localStorage error
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('Storage full')
    })

    addNotification({
      type: NOTIFICATION_TYPES.SYSTEM.id,
      title: 'Test',
      message: 'Test message',
    })

    expect(error.value).toEqual({
      message: 'Failed to save notifications',
      details: 'Storage full',
    })
  })
})
