<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">{{ t('menu.logout') }}</h1>
    <p>Logging out...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslations } from '@/composables/useTranslations'

const router = useRouter()
const { t } = useTranslations()

onMounted(() => {
  // Add any logout logic here (e.g., clearing session, tokens, etc.)
  setTimeout(() => {
    router.push('/') // Redirect to home page after logout
  }, 1000)
})
</script>
