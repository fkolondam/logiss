<template>
  <div class="relative inline-block data-selector">
    <!-- Data Selector Button -->
    <button
      @click="isOpen = !isOpen"
      class="flex items-center text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm min-w-[140px] sm:min-w-[180px] md:min-w-[200px]"
    >
      <div class="flex items-center gap-2 px-3 py-2 flex-1">
        <component :is="getCurrentScopeIcon" class="w-4 h-4 text-gray-500 shrink-0" />
        <span class="truncate">{{ currentScopeLabel }}</span>
      </div>
      <div class="px-2 py-2">
        <ChevronDown class="w-4 h-4 text-gray-500" :class="{ 'rotate-180': isOpen }" />
      </div>
    </button>

    <!-- Enhanced Dropdown Menu -->
    <div
      v-if="isOpen"
      class="fixed inset-x-0 top-16 bottom-16 md:absolute md:inset-x-auto md:left-0 md:top-full md:bottom-auto md:w-[320px] bg-white md:rounded-lg shadow-lg border-x md:border border-gray-200 z-50 flex flex-col"
    >
      <!-- Header with Search -->
      <div class="sticky top-0 p-4 border-b bg-white">
        <div class="text-sm font-medium text-gray-900 mb-2">{{ t('dataSelector.title') }}</div>
        <!-- Search Input -->
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            class="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :placeholder="t('dataSelector.searchPlaceholder')"
          />
        </div>
        <!-- Quick Filters -->
        <div class="flex flex-wrap gap-1 mt-2">
          <button
            v-for="filter in quickFilters"
            :key="filter.id"
            @click="toggleFilter(filter.id)"
            :class="[
              'px-2 py-1 text-xs font-medium rounded-md transition-colors',
              activeFilters.includes(filter.id)
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- Scope Groups -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-2 space-y-1">
          <!-- Global -->
          <div v-if="canSelectGlobalScope">
            <div
              class="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase flex items-center justify-between"
            >
              <span>{{ t('scope.global') }}</span>
              <span class="text-gray-400">1</span>
            </div>
            <button
              @click="selectScope({ type: 'global' })"
              class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md group relative"
              :class="[
                currentScope?.type === 'global'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50',
              ]"
            >
              <Globe class="w-4 h-4" />
              <span class="flex-1 text-left">{{ t('scope.allData') }}</span>
              <Check v-if="currentScope?.type === 'global'" class="w-4 h-4" />
            </button>
          </div>

          <!-- Regions -->
          <div v-if="filteredRegions.length > 0">
            <div
              class="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase flex items-center justify-between"
            >
              <span>{{ t('scope.regions') }}</span>
              <span class="text-gray-400">{{ filteredRegions.length }}</span>
            </div>
            <div class="space-y-0.5">
              <button
                v-for="region in filteredRegions"
                :key="region"
                @click="selectScope({ type: 'region', value: region })"
                class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md group"
                :class="[
                  currentScope?.type === 'region' && currentScope?.value === region
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50',
                ]"
              >
                <Map class="w-4 h-4" />
                <span class="flex-1 text-left">{{ region }}</span>
                <Check
                  v-if="currentScope?.type === 'region' && currentScope?.value === region"
                  class="w-4 h-4"
                />
                <!-- Branch Count -->
                <span class="text-xs text-gray-400">
                  {{ getBranchesForRegion(region).length }} {{ t('scope.branches').toLowerCase() }}
                </span>
              </button>
            </div>
          </div>

          <!-- Branches -->
          <div v-if="filteredBranches.length > 0">
            <div
              class="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase flex items-center justify-between"
            >
              <span>{{ t('scope.branches') }}</span>
              <span class="text-gray-400">{{ filteredBranches.length }}</span>
            </div>
            <div class="space-y-0.5">
              <button
                v-for="branch in filteredBranches"
                :key="branch"
                @click="selectScope({ type: 'branch', value: branch })"
                class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md group"
                :class="[
                  currentScope?.type === 'branch' && currentScope?.value === branch
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50',
                ]"
              >
                <Building2 class="w-4 h-4" />
                <div class="flex-1 text-left">
                  <div>{{ branch }}</div>
                  <div class="text-xs text-gray-500">{{ getBranchRegion(branch) }}</div>
                </div>
                <Check
                  v-if="currentScope?.type === 'branch' && currentScope?.value === branch"
                  class="w-4 h-4"
                />
              </button>
            </div>
          </div>

          <!-- No Results -->
          <div
            v-if="!filteredRegions.length && !filteredBranches.length"
            class="p-4 text-center text-gray-500"
          >
            {{ t('dataSelector.noResults') }}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 p-2 border-t bg-white">
        <div class="flex gap-2">
          <button
            @click="clearScope"
            class="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <RefreshCw class="w-4 h-4" />
            {{ t('dataSelector.resetScope') }}
          </button>
          <button
            @click="isOpen = false"
            class="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md"
          >
            <Check class="w-4 h-4" />
            {{ t('common.done') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Database,
  ChevronDown,
  Globe,
  Map,
  Building2,
  RefreshCw,
  Search,
  Check,
} from 'lucide-vue-next'
import { useUserStore } from '../../stores/user'
import { useTranslations } from '../../composables/useTranslations'
import { branchConfig } from '../../services/mockdata/generators/branchData'

const userStore = useUserStore()
const { t } = useTranslations()

// UI State
const isOpen = ref(false)
const searchQuery = ref('')
const activeFilters = ref([])

// Quick filters configuration
const quickFilters = [
  { id: 'recent', label: t('dataSelector.filters.recent') },
  { id: 'favorites', label: t('dataSelector.filters.favorites') },
]

// Current scope from store
const currentScope = computed(() => userStore.scope)

// Permission checks
const canSelectGlobalScope = computed(() => userStore.roleConfig?.level === 'global')

// Get current scope icon
const getCurrentScopeIcon = computed(() => {
  switch (currentScope.value?.type) {
    case 'global':
      return Globe
    case 'region':
      return Map
    case 'branch':
      return Building2
    default:
      return Database
  }
})

// Available regions and branches with filtering
const availableRegions = computed(() => [
  ...new Set(Object.values(branchConfig).map((b) => b.region)),
])

const availableBranches = computed(() => Object.keys(branchConfig))

// Filtered regions based on search and active filters
const filteredRegions = computed(() => {
  let regions = [...availableRegions.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    regions = regions.filter((region) => region.toLowerCase().includes(query))
  }

  return regions
})

// Filtered branches based on search and active filters
const filteredBranches = computed(() => {
  let branches = [...availableBranches.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    branches = branches.filter(
      (branch) =>
        branch.toLowerCase().includes(query) ||
        getBranchRegion(branch).toLowerCase().includes(query),
    )
  }

  // Filter by selected region if any
  if (currentScope.value?.type === 'region') {
    branches = branches.filter((branch) => getBranchRegion(branch) === currentScope.value.value)
  }

  return branches
})

// Helper functions
const getBranchRegion = (branch) => {
  return branchConfig[branch]?.region || ''
}

const getBranchesForRegion = (region) => {
  return Object.entries(branchConfig)
    .filter(([_, config]) => config.region === region)
    .map(([branch]) => branch)
}

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

// Toggle quick filters
const toggleFilter = (filterId) => {
  const index = activeFilters.value.indexOf(filterId)
  if (index === -1) {
    activeFilters.value.push(filterId)
  } else {
    activeFilters.value.splice(index, 1)
  }
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
