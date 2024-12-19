import { defineStore } from 'pinia'
import en from '../locales/en'
import id from '../locales/id'

export const useTranslationsStore = defineStore('translations', {
  state: () => ({
    currentLanguage: 'id',
    translations: {
      en,
      id
    },
    isInitialized: false,
    error: null
  }),

  getters: {
    currentTranslations: (state) => {
      if (!state.translations[state.currentLanguage]) {
        console.error(`No translations found for language: ${state.currentLanguage}`)
        return {}
      }
      return state.translations[state.currentLanguage]
    }
  },

  actions: {
    validateTranslations() {
      const languages = Object.keys(this.translations)
      if (languages.length === 0) {
        throw new Error('No translations available')
      }

      // Validate each language has the required keys
      const requiredKeys = [
        'app.title',
        'menu.home',
        'menu.deliveries',
        'menu.expenses',
        'menu.vehicles',
        'menu.profile',
        'menu.logout',
        'dashboard.title',
        'dashboard.recentDeliveries',
        'expenses.title',
        'expenses.periods.month',
        'expenses.periods.week',
        'expenses.periods.today',
        'expenses.periods.thisMonth',
        'expenses.periods.thisWeek',
        'expenses.breakdown',
        'expenses.categories.fuel',
        'expenses.categories.maintenance',
        'expenses.categories.insurance',
        'expenses.categories.others',
        'expenses.stats.total',
        'expenses.stats.approved',
        'expenses.stats.pending',
        'vehicles.title',
        'vehicles.fuel',
        'vehicles.status.active',
        'vehicles.status.maintenance',
        'vehicles.status.inactive'
      ]
      languages.forEach(lang => {
        const translations = this.translations[lang]
        requiredKeys.forEach(key => {
          const value = key.split('.').reduce((obj, k) => obj?.[k], translations)
          if (value === undefined) {
            console.warn(`Missing translation key "${key}" in language "${lang}"`)
          }
        })
      })
    },

    setLanguage(lang) {
      if (!this.translations[lang]) {
        const error = `Invalid language: ${lang}. Available languages: ${Object.keys(this.translations).join(', ')}`
        console.error(error)
        throw new Error(error)
      }
      
      console.log(`Setting language to: ${lang}`)
      console.log('Available translations:', Object.keys(this.translations[lang]))
      
      this.currentLanguage = lang
      this.isInitialized = true
      this.error = null
    },

    async init() {
      try {
        if (this.isInitialized) {
          return
        }

        console.log('Initializing translations store')
        console.log('Available languages:', Object.keys(this.translations))
        
        // Validate translations
        this.validateTranslations()
        
        // Set default language
        await this.setLanguage('id')
        
        console.log('Translations initialized successfully')
      } catch (error) {
        console.error('Failed to initialize translations:', error)
        this.error = error.message
        throw error
      }
    }
  }
})
