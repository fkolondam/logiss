import { ref } from 'vue'

// Cache keys with metadata
export const CACHE_KEYS = {
  RECENT_DELIVERIES: {
    key: 'recent-deliveries',
    duration: 5, // minutes
    maxItems: 10,
  },
  EXPENSES_STATS: {
    key: 'expenses-stats',
    duration: 15, // minutes
    maxItems: null, // no limit
  },
  VEHICLES_STATUS: {
    key: 'vehicles-status',
    duration: 10, // minutes
    maxItems: null,
  },
}

// Default cache duration in minutes
const DEFAULT_CACHE_DURATION = 5

export function useDashboardCache() {
  const cache = ref(new Map())

  // Validate cache item
  const isValidCache = (item, duration) => {
    if (!item) return false
    const now = new Date().getTime()
    return now - item.timestamp <= duration * 60 * 1000
  }

  // Get cached data with validation
  const getCached = (cacheKey) => {
    try {
      const key = typeof cacheKey === 'string' ? cacheKey : cacheKey.key
      const duration =
        (typeof cacheKey === 'object' ? cacheKey.duration : null) || DEFAULT_CACHE_DURATION

      const item = cache.value.get(key)
      if (!isValidCache(item, duration)) {
        cache.value.delete(key)
        return null
      }

      return item.data
    } catch (error) {
      console.error('Error getting cached data:', error)
      return null
    }
  }

  // Set cached data with metadata
  const setCached = (cacheKey, data) => {
    try {
      const key = typeof cacheKey === 'string' ? cacheKey : cacheKey.key
      const maxItems = typeof cacheKey === 'object' ? cacheKey.maxItems : null

      // Apply max items limit if specified
      if (maxItems && Array.isArray(data)) {
        data = data.slice(0, maxItems)
      }

      cache.value.set(key, {
        data,
        timestamp: new Date().getTime(),
        metadata: {
          size: JSON.stringify(data).length,
          type: Array.isArray(data) ? 'array' : typeof data,
        },
      })
    } catch (error) {
      console.error('Error setting cached data:', error)
    }
  }

  // Clear expired cache entries
  const clearExpiredCache = () => {
    try {
      for (const [key, value] of cache.value.entries()) {
        const cacheKeyObj = Object.values(CACHE_KEYS).find((k) => k.key === key)
        const duration = cacheKeyObj?.duration || DEFAULT_CACHE_DURATION

        if (!isValidCache(value, duration)) {
          cache.value.delete(key)
        }
      }
    } catch (error) {
      console.error('Error clearing expired cache:', error)
    }
  }

  // Clear specific cache key
  const clearCacheKey = (key) => {
    try {
      cache.value.delete(typeof key === 'string' ? key : key.key)
    } catch (error) {
      console.error('Error clearing cache key:', error)
    }
  }

  // Clear all cache
  const clearCache = () => {
    try {
      cache.value.clear()
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }

  // Get cache statistics
  const getCacheStats = () => {
    try {
      const stats = {
        totalEntries: cache.value.size,
        totalSize: 0,
        entriesByType: {},
      }

      for (const [key, value] of cache.value.entries()) {
        const type = value.metadata?.type || 'unknown'
        stats.totalSize += value.metadata?.size || 0
        stats.entriesByType[type] = (stats.entriesByType[type] || 0) + 1
      }

      return stats
    } catch (error) {
      console.error('Error getting cache stats:', error)
      return null
    }
  }

  // Auto-clear expired cache entries periodically
  setInterval(clearExpiredCache, 60000) // Run every minute

  return {
    CACHE_KEYS,
    getCached,
    setCached,
    clearCache,
    clearCacheKey,
    clearExpiredCache,
    getCacheStats,
  }
}
