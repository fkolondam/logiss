<template>
  <div class="relative">
    <!-- Data Source Selector Button -->
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100"
    >
      <Database class="w-4 h-4" />
      <span>{{ currentSourceLabel }}</span>
      <ChevronDown class="w-4 h-4" :class="{ 'transform rotate-180': isOpen }" />
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50"
    >
      <div class="p-2">
        <h3 class="text-sm font-medium text-gray-900 px-3 py-2">
          {{ t('debug.dataSourceControl') }}
        </h3>
        <div class="mt-2 space-y-1">
          <button
            v-for="source in dataSources"
            :key="source.type"
            @click="switchSource(source.type)"
            class="flex items-center w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-100"
            :class="{ 'bg-blue-50 text-blue-700': isCurrentSource(source.type) }"
          >
            <component :is="source.icon" class="w-4 h-4 mr-2" />
            {{ t(`dataSources.${source.type}`) }}
          </button>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div
        v-if="store.isLoading"
        class="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg"
      >
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    </div>

    <!-- Error Toast -->
    <div
      v-if="store.hasError"
      class="absolute right-0 mt-2 w-72 bg-red-50 border border-red-200 rounded-lg shadow-lg z-50 p-4"
    >
      <div class="flex">
        <AlertCircle class="w-5 h-5 text-red-400 mr-2" />
        <div class="flex-1">
          <h3 class="text-sm font-medium text-red-800">{{ t('app.error') }}</h3>
          <p class="mt-1 text-sm text-red-600">{{ store.errorMessage }}</p>
        </div>
        <button @click="store.clearError" class="text-red-400 hover:text-red-500">
          <X class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDataSourceStore } from '@/stores/dataSource'
import { DataSourceType } from '@/services/DataProviderFactory'
import { Database, ChevronDown, AlertCircle, X } from 'lucide-vue-next'
import { useTranslations } from '@/composables/useTranslations'

const store = useDataSourceStore()
const { t } = useTranslations()
const isOpen = ref(false)

const dataSources = [
  {
    type: DataSourceType.MOCK,
    icon: Database
  },
  {
    type: DataSourceType.MYSQL,
    icon: Database
  },
  {
    type: DataSourceType.GOOGLE_SHEETS,
    icon: Database
  }
]

const currentSourceLabel = computed(() => {
  const sourceType = store.currentSource
  return t(`dataSources.${sourceType}`)
})

const isCurrentSource = (type) => store.currentSource === type

const switchSource = async (type) => {
  await store.switchDataSource(type)
  isOpen.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
