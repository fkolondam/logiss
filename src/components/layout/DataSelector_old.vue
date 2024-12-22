<template>
  <div class="relative inline-block">
    <!-- Data Selector Button -->
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <Database class="w-4 h-4 text-gray-500" />
      <span>{{ currentScopeLabel }}</span>
      <ChevronDown class="w-4 h-4 text-gray-500" :class="{ 'rotate-180': isOpen }" />
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      <!-- Current Scope Info -->
      <div class="p-4 border-b bg-gray-50">
        <div class="text-sm font-medium text-gray-900">{{ t('dataSelector.title') }}</div>
        <div class="text-xs text-gray-500 mt-1">{{ t('dataSelector.description') }}</div>
      </div>

      <!-- Scope Groups -->
      <div class="p-2 space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
        <!-- Global -->
        <div>
          <div class="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase">
            {{ t('scope.global') }}
          </div>
          <button
            @click="selectScope({ type: 'global' })"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md"
            :class="[
              currentScope?.type === 'global'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50',
            ]"
          >
            <Globe class="w-4 h-4" />
            {{ t('scope.allData') }}
          </button>
        </div>

        <!-- Regions -->
        <div>
          <div class="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase">
            {{ t('scope.regions') }}
          </div>
          <button
            v-for="region in availableRegions"
            :key="region"
            @click="selectScope({ type: 'region', value: region })"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md"
            :class="[
              currentScope?.type === 'region' && currentScope?.value === region
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50',
            ]"
          >
            <Map class="w-4 h-4" />
            {{ region }}
          </button>
        </div>

        <!-- Branches -->
        <div>
          <div class="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase">
            {{ t('scope.branches') }}
          </div>
          <button
            v-for="branch in availableBranches"
            :key="branch"
            @click="selectScope({ type: 'branch', value: branch })"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md"
            :class="[
              currentScope?.type === 'branch' && currentScope?.value === branch
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50',
            ]"
          >
            <Building2 class="w-4 h-4" />
            {{ branch }}
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-2 border-t bg-gray-50">
        <button
          @click="clearScope"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
        >
          <RefreshCw class="w-4 h-4" />
          {{ t('dataSelector.resetScope') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Database, ChevronDown, Globe, Map, Building2, RefreshCw } from 'lucide-vue-next'
import { useUserStore } from '../../stores/user'
import { useTranslations } from '../../composables/useTranslations'
import { branchConfig } from '../../services/mockdata/generators/branchData'

const userStore = useUserStore()
const { t } = useTranslations()
const isOpen = ref(false)

// Current scope from store
const currentScope = computed(() => userStore.scope)

// Available regions and branches
const availableRegions = computed(() => [
  ...new Set(Object.values(branchConfig).map((b) => b.region)),
])

const availableBranches = computed(() => Object.keys(branchConfig))

// Computed label for current scope
const currentScopeLabel = computed(() => {
  if (!currentScope.value) return t('dataSelector.selectScope')

  switch (currentScope.value.type) {
    case 'global':
      return t('scope.allData')
    case 'region':
      return currentScope.value.value
    case 'branch':
      return currentScope.value.value
    default:
      return t('dataSelector.selectScope')
  }
})

// Handle scope selection
const selectScope = (scope) => {
  userStore.setScope(scope)
  isOpen.value = false
}

// Clear scope selection
const clearScope = () => {
  userStore.clearScope()
  isOpen.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.data-selector')) {
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
