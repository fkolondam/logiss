<template>
  <div>
    <AppLayout v-if="isReady">
      <RouterView />
      <button @click="switchLanguage('en')">Switch to English</button>
      <button @click="switchLanguage('id')">Switch to Indonesian</button>
    </AppLayout>
    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useTranslationsStore } from './stores/translations'
import AppLayout from './layouts/AppLayout.vue' // Corrected comment style

export default {
  setup() {
    const store = useTranslationsStore()
    const isReady = ref(false)

    const switchLanguage = (lang) => {
      store.setLanguage(lang)
      console.log(`Language switched to: ${lang}`)
    }

    // Simulate readiness
    setTimeout(() => {
      isReady.value = true
    }, 1000)

    return {
      isReady,
      switchLanguage
    }
  }
}
</script>

<style>
/* Add any global styles here */
</style>
