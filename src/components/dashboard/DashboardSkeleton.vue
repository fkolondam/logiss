<!-- Loading skeleton component for dashboard -->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: value => ['card', 'list', 'stats', 'chart'].includes(value)
  },
  rows: {
    type: Number,
    default: 3
  },
  columns: {
    type: Number,
    default: 1
  },
  height: {
    type: String,
    default: 'auto'
  }
})

// Compute animation delay for staggered effect
const getAnimationDelay = (index) => {
  return `${index * 150}ms`
}

// Compute width for skeleton items
const getWidth = (index) => {
  // Vary widths to make it look more natural
  const widths = ['60%', '75%', '85%', '70%', '80%']
  return widths[index % widths.length]
}
</script>

<template>
  <!-- Card Skeleton -->
  <div v-if="type === 'card'" class="bg-white rounded-lg shadow p-4 animate-pulse" :style="{ height }">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-4">
      <div class="w-8 h-8 bg-gray-200 rounded-lg"></div>
      <div class="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
    
    <!-- Content -->
    <div class="space-y-3">
      <div 
        v-for="i in rows" 
        :key="i"
        class="flex items-center gap-2"
        :style="{ animationDelay: getAnimationDelay(i) }"
      >
        <div class="h-4 bg-gray-200 rounded" :style="{ width: getWidth(i) }"></div>
      </div>
    </div>
  </div>

  <!-- List Skeleton -->
  <div v-else-if="type === 'list'" class="space-y-3 animate-pulse" :style="{ height }">
    <div 
      v-for="i in rows" 
      :key="i"
      class="bg-white rounded-lg p-3 flex items-center gap-3"
      :style="{ animationDelay: getAnimationDelay(i) }"
    >
      <div class="w-10 h-10 bg-gray-200 rounded-lg"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        <div class="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  </div>

  <!-- Stats Skeleton -->
  <div v-else-if="type === 'stats'" class="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse" :style="{ height }">
    <div 
      v-for="i in 4" 
      :key="i"
      class="bg-white rounded-lg p-3"
      :style="{ animationDelay: getAnimationDelay(i) }"
    >
      <div class="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div class="h-8 bg-gray-200 rounded w-2/3"></div>
    </div>
  </div>

  <!-- Chart Skeleton -->
  <div v-else-if="type === 'chart'" class="bg-white rounded-lg p-4 animate-pulse" :style="{ height }">
    <!-- Chart Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="h-4 bg-gray-200 rounded w-1/4"></div>
      <div class="h-4 bg-gray-200 rounded w-1/6"></div>
    </div>
    
    <!-- Chart Area -->
    <div class="relative" style="height: calc(100% - 2rem)">
      <div class="absolute inset-0 flex items-end space-x-2">
        <div 
          v-for="i in 12" 
          :key="i"
          class="flex-1 bg-gray-200 rounded-t"
          :style="{ 
            height: Math.random() * 80 + 20 + '%',
            animationDelay: getAnimationDelay(i)
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

/* Staggered animation for children */
.animate-pulse > * {
  animation: fadeIn 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
