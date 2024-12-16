import { computed } from 'vue'
import { useTranslationsStore } from '../stores/translations'

export function useTranslations() {
  const store = useTranslationsStore()

  // Initialize store if not already initialized
  if (!store.isInitialized) {
    console.log('Initializing translations from composable')
    store.init().catch(error => {
      console.error('Failed to initialize translations:', error)
    })
  }

  const t = (key) => {
    if (!key) {
      console.error('Translation key is required')
      return ''
    }

    // Check if store is initialized
    if (!store.isInitialized) {
      console.warn('Translations not yet initialized')
      return key
    }

    // Check if there's an error in the store
    if (store.error) {
      console.error('Translation store has an error:', store.error)
      return key
    }

    const translations = store.translations[store.currentLanguage]
    if (!translations) {
      console.error(`No translations found for language: ${store.currentLanguage}`)
      console.log('Available languages:', Object.keys(store.translations))
      return key
    }

    // Split the key and validate each part
    const parts = key.split('.')
    let current = translations
    let path = []
    
    for (const part of parts) {
      path.push(part)
      
      if (!current || typeof current !== 'object') {
        console.warn(`Translation resolution failed at: ${path.join('.')}`)
        console.log('Current value:', current)
        console.log('Available keys at parent level:', 
          path.length > 1 
            ? Object.keys(path.slice(0, -1).reduce((obj, k) => obj?.[k], translations) || {})
            : Object.keys(translations)
        )
        return key
      }
      
      if (!(part in current)) {
        console.warn(`Missing key "${part}" in path: ${path.join('.')}`)
        console.log('Available keys at this level:', Object.keys(current))
        return key
      }
      
      current = current[part]
    }

    if (current === undefined || current === null) {
      console.warn(`Invalid value at path: ${path.join('.')}`)
      console.log('Final value:', current)
      return key
    }

    if (typeof current === 'object') {
      console.warn(`Found object instead of string at path: ${path.join('.')}`)
      console.log('Available subkeys:', Object.keys(current))
      return key
    }

    return current
  }

  return {
    t,
    currentLanguage: computed(() => store.currentLanguage),
    setLanguage: async (lang) => {
      try {
        await store.setLanguage(lang)
      } catch (error) {
        console.error('Failed to set language:', error)
        throw error
      }
    }
  }
}
