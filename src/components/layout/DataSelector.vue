<template>
  <div class="relative inline-block data-selector">
    <!-- Data Selector Button -->
    <button
      @click="isOpen = !isOpen"
      class="flex items-center text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm min-w-[140px] sm:min-w-[180px] md:min-w-[200px]"
    >
      <div class="flex items-center gap-2 px-3 py-2 flex-1">
        <Database class="w-4 h-4 text-gray-500 shrink-0" />
        <span class="truncate">{{ currentScopeLabel }}</span>
      </div>
      <div class="px-2 py-2">
        <ChevronDown class="w-4 h-4 text-gray-500" :class="{ 'rotate-180': isOpen }" />
      </div>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="fixed inset-x-0 top-16 bottom-16 md:absolute md:inset-x-auto md:left-0 md:top-full md:bottom-auto md:w-[320px] bg-white md:rounded-lg shadow-lg border-x md:border border-gray-200 z-50 flex flex-col"
    >
      <!-- Current Scope Info -->
      <div class="sticky top-0 p-4 border-b bg-gray-50/90 backdrop-blur-sm">
        <div class="text-sm font-medium text-gray-900">{{ t('dataSelector.title') }}</div>
        <div class="text-xs text-gray-500 mt-1">{{ t('dataSelector.description') }}</div>
      </div>

      <!-- Scope Groups -->
      <div class="flex-1 p-2 space-y-1 overflow-y-auto max-h-40">
        <!-- Global (only for admin) -->
        <div v-if="canAccessGlobal">
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
        <div v-if="availableRegions.length > 0">
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
        <div v-if="availableBranches.length > 0">
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
      <div class="sticky bottom-0 p-2 border-t bg-gray-50/90 backdrop-blur-sm">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Database, ChevronDown, Globe, Map, Building2, RefreshCw } from 'lucide-vue-next'
import { useUserStore } from '../../stores/user'
import { useTranslations } from '../../composables/useTranslations'
import { regionBranches } from '../../config/users'

const userStore = useUserStore()
const { t } = useTranslations()

// UI State
const isOpen = ref(false)

// Current scope from store
const currentScope = computed(() => userStore.scope)
const currentUser = computed(() => userStore.currentUser)

// Check if user can access global scope
const canAccessGlobal = computed(() => currentUser.value?.role === 'admin')

// Available regions based on user role
const availableRegions = computed(() => {
  switch (currentUser.value?.role) {
    case 'admin':
      return Object.keys(regionBranches)
    case 'regional_manager':
      return [currentUser.value.scope.value]
    case 'branch_manager':
    case 'staff':
    case 'operational':
      return currentUser.value.region ? [currentUser.value.region] : []
    default:
      return []
  }
})

// Available branches based on user role
const availableBranches = computed(() => {
  switch (currentUser.value?.role) {
    case 'admin':
      // Admin can see all branches
      return Object.values(regionBranches).flat()
    case 'regional_manager':
      // Regional manager can see all branches in their region
      return regionBranches[currentUser.value.scope.value] || []
    case 'branch_manager':
    case 'staff':
      // Branch level users can only see their branch
      return [currentUser.value.scope.value]
    case 'operational':
      // Operational users can only see their assigned branch
      return [currentUser.value.branch]
    default:
      return []
  }
})

// Computed label for current scope
const currentScopeLabel = computed(() => {
  if (!currentScope.value) return t('dataSelector.selectScope')

  switch (currentScope.value.type) {
    case 'global':
      return t('scope.allData')
    case 'region':
      return `${t('scope.region')}: ${currentScope.value.value}`
    case 'branch':
      return `${t('scope.branch')}: ${currentScope.value.value}`
    default:
      return t('dataSelector.selectScope')
  }
})

// Handle scope selection
const selectScope = (scope) => {
  if (userStore.canSelectScope(scope)) {
    userStore.setScope(scope)
    isOpen.value = false
  }
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
