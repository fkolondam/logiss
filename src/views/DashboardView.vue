<template>
    <div>
      <h1 class="text-2xl font-bold mb-6">{{ t('dashboard.title') }}</h1>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RecentDeliveries />
        <ExpensesOverview />
        <VehicleStatus />
      </div>
    </div>
</template>
  
<script setup>
import RecentDeliveries from '@/components/dashboard/RecentDeliveries.vue'
import ExpensesOverview from '@/components/dashboard/ExpensesOverview.vue'
import VehicleStatus from '@/components/dashboard/VehicleStatus.vue'
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()
</script>
