<template>
    <div class="relative">
      <!-- Main Content -->
      <div class="transition-all duration-500 ease-in-out"
           :class="{ 'md:mr-96': selectedDelivery && !isMobile }">
        <h1 class="text-2xl font-bold mb-6">{{ t('deliveries.title') }}</h1>
        <DeliveryStats />
        <DeliveriesTable @show-detail="showDeliveryDetail" />
      </div>
      
      <DeliveryDetail 
        v-if="selectedDelivery"
        :delivery="selectedDelivery"
        :is-mobile="isMobile"
        @close="selectedDelivery = null"
      />
    </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useTranslations } from '@/composables/useTranslations'
import DeliveryStats from '@/components/deliveries/DeliveryStats.vue'
import DeliveriesTable from '@/components/deliveries/DeliveriesTable.vue'
import DeliveryDetail from '@/components/deliveries/DeliveryDetail.vue'

const { t } = useTranslations()
const isMobile = inject('isMobile', ref(false)) // Berikan default value
const selectedDelivery = ref(null)

const showDeliveryDetail = (delivery) => {
  selectedDelivery.value = delivery
}
</script>
