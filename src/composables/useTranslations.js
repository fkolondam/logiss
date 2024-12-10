import { computed } from 'vue'
import { useTranslationsStore } from '@/stores/translations'
import en from '@/locales/en'
import id from '@/locales/id'

const translations = {
  en,
  id
}

export function useTranslations() {
const store = useTranslationsStore();
console.log('Current Language:', store.currentLanguage); // Log current language
  
  const t = (key) => {
    const keys = key.split('.')
    let value = translations[store.currentLanguage];
    console.log('Retrieving translation for key:', key, 'Value found:', value); // Log the key and value
    console.log('Translation object:', JSON.stringify(translations[store.currentLanguage], null, 2)); // Log the entire translation object as a string
    
    for (const k of keys) {
      if (value && value[k] !== undefined) {
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
