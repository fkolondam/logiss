<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'card',
    validator: (value) => ['card', 'list', 'stats'].includes(value),
  },
})
</script>

<template>
  <div class="bg-white rounded-lg shadow animate-pulse" :data-testid="`skeleton-${props.type}`">
    <!-- Header -->
    <div class="p-4 border-b">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 bg-gray-200 rounded"></div>
        <div class="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <!-- Card Type -->
      <template v-if="type === 'card'">
        <div class="space-y-4">
          <!-- Stats Grid -->
          <div class="grid grid-cols-3 gap-2">
            <div v-for="i in 3" :key="i" class="bg-gray-100 rounded-lg p-3">
              <div class="h-3 w-16 bg-gray-200 rounded mb-2"></div>
              <div class="h-6 w-10 bg-gray-200 rounded"></div>
            </div>
          </div>

          <!-- Chart Placeholder -->
          <div class="h-32 bg-gray-100 rounded-lg"></div>
        </div>
      </template>

      <!-- List Type -->
      <template v-else-if="type === 'list'">
        <div class="space-y-3">
          <div v-for="i in 5" :key="i" class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-200 rounded"></div>
            <div class="flex-1">
              <div class="h-3 w-24 bg-gray-200 rounded mb-2"></div>
              <div class="h-2 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </template>

      <!-- Stats Type -->
      <template v-else>
        <div class="space-y-4">
          <!-- Stats Grid -->
          <div class="grid grid-cols-2 gap-2">
            <div v-for="i in 4" :key="i" class="bg-gray-100 rounded-lg p-3">
              <div class="h-3 w-16 bg-gray-200 rounded mb-2"></div>
              <div class="h-6 w-10 bg-gray-200 rounded"></div>
            </div>
          </div>

          <!-- List Items -->
          <div class="space-y-2">
            <div v-for="i in 3" :key="i" class="flex items-center gap-2">
              <div class="w-8 h-8 bg-gray-200 rounded"></div>
              <div class="flex-1">
                <div class="h-3 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
