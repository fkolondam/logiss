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
import { useUserStore } from './stores/user'
import { useDataSourceStore } from './stores/dataSource'
import { DataSourceType } from './services/DataProviderFactory'
import AppLayout from './layouts/AppLayout.vue'

const isReady = ref(false)
const translationsStore = useTranslationsStore()
const userStore = useUserStore()
const dataSourceStore = useDataSourceStore()

onMounted(async () => {
  try {
    // Initialize translations
    await translationsStore.init()

    // Initialize user (default to admin for testing)
    await userStore.switchUser('admin1')

    // Initialize data source to Google Sheets
    console.log('Switching to Google Sheets data source...')
    await dataSourceStore.switchDataSource(DataSourceType.GOOGLE_SHEETS)
    console.log('Successfully switched to Google Sheets')

    isReady.value = true
  } catch (error) {
    console.error('Error initializing app:', error)
    throw error
  }
})
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
