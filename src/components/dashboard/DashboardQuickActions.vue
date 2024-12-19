<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Plus,
  FileText,
  Truck,
  Download,
  Filter,
  Search,
  ChevronDown
} from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'
import { useDashboardExport } from '../../composables/useDashboardExport'

const { t } = useTranslations()
const router = useRouter()
const { exportDeliveries, exportExpenses, exportVehicleStatus } = useDashboardExport()

const showActions = ref(false)
const showExportMenu = ref(false)

// Quick action definitions
const quickActions = [
  {
    id: 'new-delivery',
    icon: Plus,
    label: t('quickActions.newDelivery'),
    action: () => router.push({ name: 'deliveries', query: { new: true } }),
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    id: 'view-reports',
    icon: FileText,
    label: t('quickActions.viewReports'),
    action: () => router.push({ name: 'reports' }),
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  },
  {
    id: 'check-vehicles',
    icon: Truck,
    label: t('quickActions.checkVehicles'),
    action: () => router.push({ name: 'vehicles' }),
    color: 'text-green-600',
    bg: 'bg-green-50'
  }
]

// Export options
const exportOptions = [
  {
    id: 'export-deliveries',
    label: t('export.deliveries'),
    action: () => exportDeliveries([], 'excel')
  },
  {
    id: 'export-expenses',
    label: t('export.expenses'),
    action: () => exportExpenses([], 'excel')
  },
  {
    id: 'export-vehicles',
    label: t('export.vehicles'),
    action: () => exportVehicleStatus([], 'excel')
  }
]

// Handle action click
const handleActionClick = (action) => {
  action.action()
  showActions.value = false
}

// Handle export click
const handleExportClick = (option) => {
  option.action()
  showExportMenu.value = false
  showActions.value = false
}

// Close menus when clicking outside
const closeMenus = (event) => {
  if (!event.target.closest('.quick-actions')) {
    showActions.value = false
    showExportMenu.value = false
  }
}

// Add click outside listener
onMounted(() => {
  document.addEventListener('click', closeMenus)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenus)
})
</script>

<template>
  <div class="relative quick-actions">
    <!-- Main Button -->
    <button
      class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      @click="showActions = !showActions"
    >
      <Plus class="w-4 h-4" />
      {{ t('quickActions.title') }}
      <ChevronDown class="w-4 h-4" :class="{ 'transform rotate-180': showActions }" />
    </button>

    <!-- Actions Menu -->
    <div
      v-if="showActions"
      class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-40"
    >
      <div class="py-1">
        <!-- Quick Actions -->
        <button
          v-for="action in quickActions"
          :key="action.id"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          @click="handleActionClick(action)"
        >
          <div :class="['p-1 rounded-lg', action.bg]">
            <component :is="action.icon" class="w-4 h-4" :class="action.color" />
          </div>
          {{ action.label }}
        </button>

        <!-- Divider -->
        <div class="border-t my-1"></div>

        <!-- Export Menu Trigger -->
        <button
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
          @click="showExportMenu = !showExportMenu"
        >
          <div class="flex items-center gap-2">
            <div class="p-1 rounded-lg bg-gray-50">
              <Download class="w-4 h-4 text-gray-600" />
            </div>
            {{ t('export.title') }}
          </div>
          <ChevronDown 
            class="w-4 h-4" 
            :class="{ 'transform rotate-180': showExportMenu }" 
          />
        </button>

        <!-- Export Submenu -->
        <div v-if="showExportMenu" class="bg-gray-50 py-1">
          <button
            v-for="option in exportOptions"
            :key="option.id"
            class="w-full text-left px-6 py-2 text-sm text-gray-700 hover:bg-gray-100"
            @click="handleExportClick(option)"
          >
            {{ option.label }}
          </button>
        </div>

        <!-- Additional Actions -->
        <div class="border-t my-1"></div>
        
        <button
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          @click="$emit('toggleFilters')"
        >
          <div class="p-1 rounded-lg bg-gray-50">
            <Filter class="w-4 h-4 text-gray-600" />
          </div>
          {{ t('common.filters') }}
        </button>

        <button
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          @click="$emit('toggleSearch')"
        >
          <div class="p-1 rounded-lg bg-gray-50">
            <Search class="w-4 h-4 text-gray-600" />
          </div>
          {{ t('common.search') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Menu transition */
.quick-actions-enter-active,
.quick-actions-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.quick-actions-enter-from,
.quick-actions-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
