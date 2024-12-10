<template>
    <div>
      <h1 class="text-2xl font-bold mb-6">{{ t('profile.title') }}</h1>
      <div class="bg-white rounded-lg shadow p-6">
        <p>{{ t('profile.comingSoon') }}</p>
      </div>
    </div>
</template>

<script setup>
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()
</script>
