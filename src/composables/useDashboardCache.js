import { ref } from 'vue'

export const useDashboardCache = () => {
  const cache = ref(new Map())
  const TTL = 5 * 60 * 1000 // 5 minutes

  const getCached = (key) => {
    const item = cache.value.get(key)
    if (item && Date.now() - item.timestamp < TTL) {
      return item.data
    }
    return null
  }

  const setCached = (key, data) => {
    cache.value.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  const clearCache = () => {
    cache.value.clear()
  }

  const invalidateCache = (key) => {
    cache.value.delete(key)
  }

  // Auto cleanup expired items
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of cache.value.entries()) {
      if (now - value.timestamp >= TTL) {
        cache.value.delete(key)
      }
    }
  }, TTL)

  return {
    getCached,
    setCached,
    clearCache,
    invalidateCache
  }
}

// Cache keys
export const CACHE_KEYS = {
  RECENT_DELIVERIES: 'recent-deliveries',
  EXPENSES_STATS: 'expenses-stats',
  VEHICLES_STATUS: 'vehicles-status',
  EXPENSES_HISTORY: 'expenses-history',
  DELIVERY_STATS: 'delivery-stats'
}
