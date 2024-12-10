import { computed } from 'vue'
import { useTranslationsStore } from '@/stores/translations'
import en from '@/locales/en'
import id from '@/locales/id'

const translations = {
  en,
  id
}

export function useTranslations() {
  const store = useTranslationsStore()
  
  const t = (key) => {
    const keys = key.split('.')
    let value = translations[store.currentLanguage]
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k]
      } else {
        return key
      }
    }
    
    return value
  }

  const currentLanguage = computed(() => store.currentLanguage)
  
  const setLanguage = (lang) => {
    store.setLanguage(lang)
  }

  return {
    t,
    currentLanguage,
    setLanguage
  }
}
