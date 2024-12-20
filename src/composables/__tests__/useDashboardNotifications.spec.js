import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useDashboardNotifications } from '../useDashboardNotifications'
import { useDataSource } from '../../stores/dataSource'

// Mock Vue lifecycle hooks
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    onMounted: vi.fn((fn) => fn()),
    onUnmounted: vi.fn(),
  }
})

// Mock the dataSource store
vi.mock('../../stores/dataSource', () => ({
  useDataSource: vi.fn(),
}))

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key]),
    setItem: vi.fn((key, value) => {
      store[key] = value
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

// Mock Audio
class AudioMock {
  constructor(url) {
    this.src = url
  }
  play() {
    return Promise.resolve()
  }
}

describe('useDashboardNotifications', () => {
  let composable
  let mockProvider

  beforeEach(() => {
    // Setup fake timers
    vi.useFakeTimers()

    // Setup mocks
    vi.clearAllMocks()
    localStorageMock.clear()
    global.localStorage = localStorageMock
    global.Audio = AudioMock

    // Setup mock provider that returns empty notifications by default
    mockProvider = {
      fetch: vi.fn().mockResolvedValue([]),
      markNotificationAsRead: vi.fn(),
      markAllNotificationsAsRead: vi.fn(),
    }

    vi.mocked(useDataSource).mockImplementation(() => ({
      getProvider: () => Promise.resolve(mockProvider),
    }))

    // Create fresh composable instance
    composable = useDashboardNotifications()

    // Clear any existing notifications
    composable.clearNotifications()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('initializes with empty notifications', () => {
    expect(composable.notifications.value).toEqual([])
  })

  it('loads notifications from localStorage', () => {
    const storedNotifications = [
      {
        id: '1',
        type: 'SYSTEM',
        title: 'Test',
        message: 'Test message',
        timestamp: new Date().toISOString(),
        read: false,
      },
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedNotifications))

    // Create new instance with stored notifications
    composable = useDashboardNotifications()
    expect(composable.notifications.value).toEqual(storedNotifications)
  })

  it('adds new notification', () => {
    const notification = {
      type: 'ERROR',
      title: 'Error',
      message: 'Test error',
    }

    const id = composable.addNotification(notification)
    expect(id).toBeTruthy()
    expect(composable.notifications.value[0]).toMatchObject({
      ...notification,
      id: expect.any(String),
      timestamp: expect.any(String),
      read: false,
    })
  })

  it('marks notification as read', () => {
    const notification = {
      type: 'SYSTEM',
      title: 'Test',
      message: 'Test message',
    }

    const id = composable.addNotification(notification)
    expect(composable.notifications.value[0].read).toBe(false)

    composable.markAsRead(id)
    expect(composable.notifications.value[0].read).toBe(true)
  })

  it('marks all notifications as read', () => {
    composable.addNotification({
      type: 'SYSTEM',
      title: 'Test 1',
      message: 'Test message 1',
    })
    composable.addNotification({
      type: 'ERROR',
      title: 'Test 2',
      message: 'Test message 2',
    })

    composable.markAllAsRead()
    expect(composable.notifications.value.every((n) => n.read)).toBe(true)
  })

  it('removes notification', () => {
    const notification = {
      type: 'SYSTEM',
      title: 'Test',
      message: 'Test message',
    }

    const id = composable.addNotification(notification)
    expect(composable.notifications.value).toHaveLength(1)

    composable.removeNotification(id)
    expect(composable.notifications.value).toHaveLength(0)
  })

  it('clears all notifications', () => {
    composable.addNotification({
      type: 'SYSTEM',
      title: 'Test 1',
      message: 'Test message 1',
    })
    composable.addNotification({
      type: 'ERROR',
      title: 'Test 2',
      message: 'Test message 2',
    })

    expect(composable.notifications.value).toHaveLength(2)
    composable.clearNotifications()
    expect(composable.notifications.value).toHaveLength(0)
  })

  it('checks vehicle notifications', () => {
    const vehicles = [
      {
        id: 'v1',
        plateNumber: 'ABC123',
        fuelLevel: 15,
        nextServiceDue: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE',
      },
    ]

    composable.checkVehicleNotifications(vehicles)
    expect(composable.notifications.value).toHaveLength(2) // Low fuel + maintenance due
  })

  it('checks delivery notifications', () => {
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

    composable.checkDeliveryNotifications(deliveries)
    expect(composable.notifications.value).toHaveLength(2) // Failed + success
  })

  it('handles errors gracefully', () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('Storage full')
    })

    composable.addNotification({
      type: 'SYSTEM',
      title: 'Test',
      message: 'Test message',
    })

    expect(composable.error.value).toEqual({
      message: 'Failed to save notifications',
      details: 'Storage full',
    })
  })
})
