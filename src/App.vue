<template>
  <AppLayout v-if="isReady">
    <RouterView />
  </AppLayout>
  <div v-else class="flex items-center justify-center min-h-screen">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useTranslationsStore } from './stores/translations'
import AppLayout from './layouts/AppLayout.vue'

const isReady = ref(false)
const translationsStore = useTranslationsStore()

onMounted(async () => {
  try {
    await translationsStore.init()
    isReady.value = true
  } catch (error) {
    console.error('Error initializing app:', error)
  }
})
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
