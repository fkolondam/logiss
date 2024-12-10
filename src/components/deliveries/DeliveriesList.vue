<template>
  <div class="bg-white rounded-lg shadow p-4">
    <h2 class="text-lg font-bold mb-4">Deliveries</h2>
    <div v-for="delivery in deliveries" :key="delivery.invoice" class="mb-4 p-4 border-b">
      <div class="flex justify-between">
        <div>
          <div class="text-sm font-medium text-gray-900">{{ delivery.customer }}</div>
          <div class="text-sm text-gray-500">{{ delivery.location }}</div>
        </div>
        <div>
          <span :class="[
            'px-3 py-1 rounded-full text-xs',
            delivery.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          ]">
            {{ delivery.status }}
          </span>
        </div>
      </div>
      <div class="text-sm text-gray-500">
        <div>{{ delivery.time }} - {{ delivery.date }}</div>
        <div>Invoice: {{ delivery.invoice }}</div>
        <div>Amount: Rp {{ formatNumber(delivery.amount) }}</div>
      </div>
      <button 
        @click="$emit('show-detail', delivery)"
        class="text-blue-600 text-sm hover:text-blue-800 mt-2"
      >
        Details
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'

const props = defineProps({
  deliveries: {
    type: Array,
    required: true
  }
})

const formatNumber = (value) => {
  return value.toLocaleString('id-ID')
}

defineEmits(['show-detail'])
</script>
