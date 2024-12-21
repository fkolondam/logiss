<script setup>
import { computed } from 'vue'
import { X, AlertCircle } from 'lucide-vue-next'
import { useTranslations } from '../../composables/useTranslations'

const props = defineProps({
  notifications: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: [String, Object],
    default: null,
  },
})

const emit = defineEmits(['close'])

const { t } = useTranslations()

const sortedNotifications = computed(() => {
  if (!Array.isArray(props.notifications)) return []
  return [...props.notifications].sort((a, b) => new Date(b.date) - new Date(a.date))
})

const hasUnread = computed(() => {
  return sortedNotifications.value.some((notification) => !notification.read)
})

const close = () => {
  emit('close')
}
</script>

<template>
  <div
    class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    data-testid="notifications-panel"
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b">
      <div class="flex items-center gap-2">
        <h3 class="text-base font-heading font-semibold">{{ t('notifications.title') }}</h3>
        <span
          v-if="hasUnread"
          class="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full"
          >{{ t('notifications.new') }}</span
        >
      </div>
      <button
        class="p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
        @click="close"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Content -->
    <div class="max-h-96 overflow-y-auto">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex items-center gap-2 text-red-600 p-4">
        <AlertCircle class="w-5 h-5" />
        <span>{{ error }}</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!notifications.length" class="text-gray-500 text-center py-4">
        {{ t('notifications.empty') }}
      </div>

      <!-- Notifications List -->
      <div v-else class="divide-y">
        <div
          v-for="notification in sortedNotifications"
          :key="notification.id"
          class="p-4 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-start gap-3">
            <div class="flex-1 min-w-0">
              <p
                :class="[
                  'text-sm',
                  notification.read ? 'text-gray-600' : 'text-gray-900 font-medium',
                ]"
              >
                {{ notification.message }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ notification.date }}
              </p>
            </div>
            <div v-if="!notification.read" class="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div v-if="hasUnread" class="p-4 border-t">
      <button
        class="w-full px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
      >
        {{ t('notifications.markAllRead') }}
      </button>
    </div>
  </div>
</template>
