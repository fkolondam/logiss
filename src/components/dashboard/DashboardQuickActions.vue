<script setup>
import { ref } from 'vue'
import { Plus, FileText, Truck } from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'
import { useRouter } from 'vue-router'

const { t } = useTranslations()
const router = useRouter()
const showMenu = ref(false)

const actions = [
  {
    label: 'quickActions.newDelivery',
    icon: Plus,
    action: () => router.push({ name: 'deliveries', query: { new: true } }),
  },
  {
    label: 'quickActions.viewReports',
    icon: FileText,
    action: () => router.push({ name: 'reports' }),
  },
  {
    label: 'quickActions.checkVehicles',
    icon: Truck,
    action: () => router.push({ name: 'vehicles' }),
  },
]

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const handleAction = (action) => {
  action()
  showMenu.value = false
}
</script>

<template>
  <div class="relative">
    <!-- Quick Actions Button -->
    <button
      class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      @click="toggleMenu"
      data-testid="quick-actions-button"
    >
      <Plus class="w-4 h-4" />
      {{ t('quickActions.title') }}
    </button>

    <!-- Quick Actions Menu -->
    <div
      v-if="showMenu"
      class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
      data-testid="quick-actions-menu"
    >
      <div class="py-1">
        <button
          v-for="(action, index) in actions"
          :key="index"
          class="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          @click="handleAction(action.action)"
        >
          <component :is="action.icon" class="w-4 h-4" />
          {{ t(action.label) }}
        </button>
      </div>
    </div>
  </div>
</template>
