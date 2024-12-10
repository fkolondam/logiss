<template>
  <div class="flex items-center justify-center h-screen">
    <h1 class="text-2xl font-bold">You have been logged out.</h1>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTranslations } from '../composables/useTranslations';

const router = useRouter();
const { t } = useTranslations();

onMounted(() => {
  // Logic to clear user session data can be added here
  // Redirect to the dashboard or login page
  setTimeout(() => {
    router.push('/');
  }, 2000); // Redirect after 2 seconds
});
</script>

<style scoped>
/* Add any necessary styles here */
</style>
