import { defineStore } from 'pinia'

export const useTranslationsStore = defineStore('translations', {
  state: () => ({
    currentLanguage: 'id' // Changed default language to Indonesian
  }),
  actions: {
    setLanguage(lang) {
      this.currentLanguage = lang
    }
  }
})
