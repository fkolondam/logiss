export interface TranslationParams {
  [key: string]: string | number
}

export interface UseTranslations {
  t: (key: string, params?: TranslationParams) => string
  currentLanguage: import('vue').ComputedRef<string>
  setLanguage: (lang: string) => Promise<void>
}

export function useTranslations(): UseTranslations
