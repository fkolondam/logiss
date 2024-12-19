import { ref, computed } from 'vue'
import { useTranslations } from './useTranslations'

export const useDashboardState = () => {
  const { t } = useTranslations()
  
  // Loading states for different sections
  const loadingStates = ref({
    deliveries: false,
    expenses: false,
    vehicles: false,
    charts: false,
    export: false
  })

  // Error states for different sections
  const errors = ref({
    deliveries: null,
    expenses: null,
    vehicles: null,
    global: null
  })

  // Retry counts for error handling
  const retryCounts = ref({
    deliveries: 0,
    expenses: 0,
    vehicles: 0
  })

  const MAX_RETRIES = 3
  const RETRY_DELAY = 1000 // 1 second

  // Check if any section is loading
  const isLoading = computed(() => 
    Object.values(loadingStates.value).some(state => state)
  )

  // Check if any section has errors
  const hasErrors = computed(() => 
    Object.values(errors.value).some(error => error !== null)
  )

  // Set loading state for a section
  const setLoading = (section, isLoading) => {
    loadingStates.value[section] = isLoading
  }

  // Set error for a section
  const setError = (section, error) => {
    errors.value[section] = error
  }

  // Clear all errors
  const clearErrors = () => {
    Object.keys(errors.value).forEach(key => {
      errors.value[key] = null
    })
  }

  // Handle API error with retry logic
  const handleError = async (section, error, retryCallback) => {
    console.error('Error in ' + section + ':', error)

    // Increment retry count
    retryCounts.value[section] = (retryCounts.value[section] || 0) + 1

    // Check if we should retry
    if (retryCounts.value[section] <= MAX_RETRIES) {
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCounts.value[section]))
      
      // Clear error and try again
      setError(section, null)
      return retryCallback()
    }

    // Set appropriate error message
    let errorMessage = t('errors.fetch' + section.charAt(0).toUpperCase() + section.slice(1))
    
    if (error.response) {
      // Handle specific API errors
      switch (error.response.status) {
        case 401:
          errorMessage = t('errors.unauthorized')
          break
        case 403:
          errorMessage = t('errors.forbidden')
          break
        case 404:
          errorMessage = t('errors.notFound')
          break
        case 500:
          errorMessage = t('errors.serverError')
          break
        default:
          errorMessage = t('errors.unknown')
      }
    } else if (error.request) {
      // Network error
      errorMessage = t('errors.network')
    }

    setError(section, errorMessage)
    return null
  }

  // Reset retry count for a section
  const resetRetryCount = (section) => {
    retryCounts.value[section] = 0
  }

  // Wrapper for async operations with loading and error handling
  const withLoadingState = async (section, operation) => {
    try {
      setLoading(section, true)
      setError(section, null)
      resetRetryCount(section)
      return await operation()
    } catch (error) {
      return handleError(section, error, () => withLoadingState(section, operation))
    } finally {
      setLoading(section, false)
    }
  }

  // Get loading skeleton config for a section
  const getSkeletonConfig = (section) => {
    const configs = {
      deliveries: {
        rows: 5,
        columns: ['date', 'customer', 'status'],
        height: '400px'
      },
      expenses: {
        rows: 4,
        columns: ['category', 'amount'],
        height: '300px'
      },
      vehicles: {
        rows: 3,
        columns: ['plateNumber', 'status', 'driver'],
        height: '250px'
      }
    }
    return configs[section] || {}
  }

  return {
    loadingStates,
    errors,
    isLoading,
    hasErrors,
    setLoading,
    setError,
    clearErrors,
    handleError,
    withLoadingState,
    getSkeletonConfig
  }
}
