import { ref } from 'vue'

// Cache keys
export const CACHE_KEYS = {
  RECENT_DELIVERIES: 'recent-deliveries',
  EXPENSES_STATS: 'expenses-stats',
  VEHICLES_STATUS: 'vehicles-status'
}

// Cache duration in minutes
const CACHE_DURATION = 5

export function useDashboardCache() {
  const cache = ref(new Map())

  // Get cached data
  const getCached = (key) => {
    const item = cache.value.get(key)
    if (!item) return null

    const now = new Date().getTime()
    if (now - item.timestamp > CACHE_DURATION * 60 * 1000) {
      cache.value.delete(key)
      return null
    }

    return item.data
  }

  // Set cached data
  const setCached = (key, data) => {
    cache.value.set(key, {
      data,
      timestamp: new Date().getTime()
    })
  }

  // Clear cache
  const clearCache = () => {
    cache.value.clear()
  }

  // Clear specific cache key
  const clearCacheKey = (key) => {
    cache.value.delete(key)
  }

  return {
    CACHE_KEYS,
    getCached,
    setCached,
    clearCache,
    clearCacheKey
  }
}
