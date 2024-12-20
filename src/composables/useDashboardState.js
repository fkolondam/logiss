import { ref, computed } from 'vue'

export function useDashboardState() {
  // Loading states for different sections
  const loadingStates = ref({
    dashboard: false,
    deliveries: false,
    expenses: false,
    vehicles: false,
    export: false
  })

  // Error states for different sections
  const errors = ref({
    dashboard: null,
    deliveries: null,
    expenses: null,
    vehicles: null,
    export: null
  })

  // Computed property for any loading state
  const isLoading = computed(() => 
    Object.values(loadingStates.value).some(state => state)
  )

  // Computed property for any error state
  const hasError = computed(() => 
    Object.values(errors.value).some(error => error !== null)
  )

  // Helper to handle loading state and errors
  const withLoadingState = async (section, callback) => {
    // Reset error state
    errors.value[section] = null
    
    try {
      // Set loading state
      loadingStates.value[section] = true
      
      // Execute callback
      const result = await callback()
      
      return result
    } catch (error) {
      console.error(`Error in ${section}:`, error)
      
      // Set error state
      errors.value[section] = error.message || 'An unexpected error occurred'
      
      // Re-throw error for handling upstream
      throw error
    } finally {
      // Ensure loading state is reset after delay
      setTimeout(() => {
        loadingStates.value[section] = false
      }, 500) // Small delay to ensure loading indicators are visible
    }
  }

  // Helper to clear all states
  const clearStates = () => {
    Object.keys(loadingStates.value).forEach(key => {
      loadingStates.value[key] = false
    })
    Object.keys(errors.value).forEach(key => {
      errors.value[key] = null
    })
  }

  // Helper to handle error
  const handleError = (section, error) => {
    console.error(`Error in ${section}:`, error)
    errors.value[section] = error.message || 'An unexpected error occurred'
    loadingStates.value[section] = false
  }

  return {
    loadingStates,
    errors,
    isLoading,
    hasError,
    withLoadingState,
    clearStates,
    handleError
  }
}
