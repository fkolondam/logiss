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
import { useDataSource } from './stores/dataSource'
import AppLayout from './layouts/AppLayout.vue'

const isReady = ref(false)
const translationsStore = useTranslationsStore()
const { getProvider } = useDataSource()

onMounted(async () => {
  try {
    // Initialize translations
    await translationsStore.init()

    // Initialize data provider
    const provider = await getProvider()
    if (!provider) {
      throw new Error('Failed to initialize data provider')
    }

    // Generate initial data
    await provider.refresh()

    // Mark app as ready
    isReady.value = true
  } catch (error) {
    console.error('Error initializing app:', error)
    // Even if there's an error, we should show the app
    // so error states can be displayed properly
    isReady.value = true
  }
})
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
