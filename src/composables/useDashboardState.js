import { ref, computed } from 'vue'

// Define state sections and their configurations
const DASHBOARD_SECTIONS = {
  dashboard: 'dashboard',
  deliveries: 'deliveries',
  expenses: 'expenses',
  vehicles: 'vehicles',
  export: 'export',
  notifications: 'notifications',
}

export function useDashboardState() {
  // Loading states with retry counts
  const loadingStates = ref({
    dashboard: {
      isLoading: false,
      retryCount: 0,
      lastLoadTime: null,
    },
    deliveries: {
      isLoading: false,
      retryCount: 0,
      lastLoadTime: null,
    },
    expenses: {
      isLoading: false,
      retryCount: 0,
      lastLoadTime: null,
    },
    vehicles: {
      isLoading: false,
      retryCount: 0,
      lastLoadTime: null,
    },
    export: {
      isLoading: false,
      retryCount: 0,
      lastLoadTime: null,
    },
    notifications: {
      isLoading: false,
      retryCount: 0,
      lastLoadTime: null,
    },
  })

  // Error states with timestamps and details
  const errors = ref({
    dashboard: {
      message: null,
      timestamp: null,
      details: null,
      code: null,
    },
    deliveries: {
      message: null,
      timestamp: null,
      details: null,
      code: null,
    },
    expenses: {
      message: null,
      timestamp: null,
      details: null,
      code: null,
    },
    vehicles: {
      message: null,
      timestamp: null,
      details: null,
      code: null,
    },
    export: {
      message: null,
      timestamp: null,
      details: null,
      code: null,
    },
    notifications: {
      message: null,
      timestamp: null,
      details: null,
      code: null,
    },
  })

  // Track data freshness
  const lastUpdated = ref({
    dashboard: null,
    deliveries: null,
    expenses: null,
    vehicles: null,
    export: null,
    notifications: null,
  })

  // Computed properties for state management
  const isLoading = computed(() =>
    Object.values(loadingStates.value).some((state) => state.isLoading),
  )

  const hasError = computed(() =>
    Object.values(errors.value).some((error) => error.message !== null),
  )

  const needsRefresh = computed(() => {
    const now = Date.now()
    const refreshThreshold = 5 * 60 * 1000 // 5 minutes

    return Object.entries(lastUpdated.value).reduce((acc, [section, timestamp]) => {
      acc[section] = timestamp === null || now - timestamp > refreshThreshold
      return acc
    }, {})
  })

  // Enhanced error handling with retry logic
  const handleError = (section, error, context = {}) => {
    console.error(`Error in ${section}:`, error, context)

    const errorState = {
      message: error.message || 'An unexpected error occurred',
      timestamp: Date.now(),
      details: error.details || null,
      code: error.code || 'UNKNOWN_ERROR',
      context,
    }

    errors.value[section] = errorState

    // Reset loading state immediately
    if (loadingStates.value[section]) {
      loadingStates.value[section].isLoading = false
      loadingStates.value[section].lastLoadTime = null
    }

    // Increment retry count if applicable
    if (context.shouldRetry && loadingStates.value[section]) {
      loadingStates.value[section].retryCount++
    }

    return errorState
  }

  // Enhanced loading state handler with retry and timeout
  const withLoadingState = async (section, callback, options = {}) => {
    const {
      timeout = 30000, // 30 second timeout
      maxRetries = 3,
      retryDelay = 1000,
      skipCache = false,
    } = options

    // Reset error state
    if (errors.value[section]) {
      errors.value[section] = {
        message: null,
        timestamp: null,
        details: null,
        code: null,
      }
    }

    // Reset loading state
    if (loadingStates.value[section]) {
      loadingStates.value[section].isLoading = true
      loadingStates.value[section].lastLoadTime = Date.now()
    }

    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timed out after ${timeout}ms`))
        }, timeout)
      })

      // Execute callback with timeout
      const result = await Promise.race([callback(), timeoutPromise])

      // Update last updated timestamp
      lastUpdated.value[section] = Date.now()

      // Reset loading state immediately on success
      if (loadingStates.value[section]) {
        loadingStates.value[section].isLoading = false
        loadingStates.value[section].lastLoadTime = null
      }

      return result
    } catch (error) {
      const shouldRetry =
        loadingStates.value[section]?.retryCount < maxRetries &&
        error.message !== 'Operation timed out'

      const errorState = handleError(section, error, { shouldRetry })

      if (shouldRetry) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
        return withLoadingState(section, callback, {
          ...options,
          maxRetries: maxRetries - 1,
        })
      }

      throw errorState
    } finally {
      // Ensure loading state is reset
      if (loadingStates.value[section]) {
        loadingStates.value[section].isLoading = false
        loadingStates.value[section].lastLoadTime = null
      }
    }
  }

  // Clear all states
  const clearStates = (sections = Object.keys(DASHBOARD_SECTIONS)) => {
    sections.forEach((section) => {
      if (loadingStates.value[section]) {
        loadingStates.value[section] = {
          isLoading: false,
          retryCount: 0,
          lastLoadTime: null,
        }
      }
      if (errors.value[section]) {
        errors.value[section] = {
          message: null,
          timestamp: null,
          details: null,
          code: null,
        }
      }
      lastUpdated.value[section] = null
    })
  }

  // Check if section needs refresh
  const shouldRefresh = (section) => {
    const lastUpdate = lastUpdated.value[section]
    if (!lastUpdate) return true

    const now = Date.now()
    const refreshThreshold = 5 * 60 * 1000 // 5 minutes
    return now - lastUpdate > refreshThreshold
  }

  return {
    DASHBOARD_SECTIONS,
    loadingStates,
    errors,
    lastUpdated,
    isLoading,
    hasError,
    needsRefresh,
    withLoadingState,
    clearStates,
    handleError,
    shouldRefresh,
  }
}
