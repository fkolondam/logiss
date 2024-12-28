<template>
  <div class="relative user-selector">
    <!-- User Button -->
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-3 h-full w-full p-3 bg-white rounded-lg border border-gray-200 shadow-md"
    >
      <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
        <UserCircle class="w-4 h-4 text-gray-500" />
      </div>
      <span class="text-sm font-medium text-gray-700">{{ currentUserLabel }}</span>
      <ChevronDown class="w-4 h-4 text-gray-500" :class="{ 'rotate-180': isOpen }" />
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[70vh] overflow-y-auto"
    >
      <!-- Current User Info -->
      <div v-if="currentUser" class="p-4 border-b">
        <div class="font-medium text-gray-900">{{ currentUser.name }}</div>
        <div class="text-sm text-gray-500">{{ getScopeLabel(currentUser.scope) }}</div>
      </div>

      <!-- Role Groups -->
      <div class="p-2 space-y-1">
        <div v-if="adminUsers.length > 0">
          <div class="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase">Global Admin</div>
          <button
            v-for="user in adminUsers"
            :key="user.id"
            @click="selectUser(user)"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-50"
            :class="[currentUser?.id === user.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600']"
          >
            <UserCircle class="w-4 h-4" />
            {{ user.name }}
          </button>
        </div>

        <div v-if="regionalManagerUsers.length > 0">
          <div class="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase">
            Regional Managers
          </div>
          <button
            v-for="user in regionalManagerUsers"
            :key="user.id"
            @click="selectUser(user)"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-50"
            :class="[currentUser?.id === user.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600']"
          >
            <UserCircle class="w-4 h-4" />
            {{ user.name }}
          </button>
        </div>

        <div v-if="branchManagerUsers.length > 0">
          <div class="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase">Branch Managers</div>
          <button
            v-for="user in branchManagerUsers"
            :key="user.id"
            @click="selectUser(user)"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-50"
            :class="[currentUser?.id === user.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600']"
          >
            <UserCircle class="w-4 h-4" />
            {{ user.name }}
          </button>
        </div>

        <div v-if="staffUsers.length > 0">
          <div class="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase">Staff</div>
          <button
            v-for="user in staffUsers"
            :key="user.id"
            @click="selectUser(user)"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-50"
            :class="[currentUser?.id === user.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600']"
          >
            <UserCircle class="w-4 h-4" />
            {{ user.name }}
          </button>
        </div>

        <div v-if="operationalUsers.length > 0">
          <div class="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase">
            Operational Users
          </div>
          <button
            v-for="user in operationalUsers"
            :key="user.id"
            @click="selectUser(user)"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-50"
            :class="[currentUser?.id === user.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600']"
          >
            <UserCircle class="w-4 h-4" />
            {{ user.name }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { UserCircle, ChevronDown } from 'lucide-vue-next'
import { useUserStore } from '../../stores/user'
import { predefinedUsers } from '../../config/users'
import { useTranslations } from '../../composables/useTranslations'

const userStore = useUserStore()
const { t } = useTranslations()
const isOpen = ref(false)

// Current user from store
const currentUser = computed(() => userStore.currentUser)

// Computed label for current user
const currentUserLabel = computed(() => currentUser.value?.name || t('menu.selectUser'))

// Group users by role
const adminUsers = computed(() => predefinedUsers.filter((u) => u.role === 'admin'))

const regionalManagerUsers = computed(() =>
  predefinedUsers.filter((u) => u.role === 'regional_manager'),
)

const branchManagerUsers = computed(() =>
  predefinedUsers.filter((u) => u.role === 'branch_manager'),
)

const staffUsers = computed(() => predefinedUsers.filter((u) => u.role === 'staff'))

const operationalUsers = computed(() => predefinedUsers.filter((u) => u.role === 'operational'))

// Get readable scope label
const getScopeLabel = (scope) => {
  if (!scope) return ''

  switch (scope.type) {
    case 'global':
      return t('scope.global')
    case 'region':
      return `${t('scope.region')}: ${scope.value}`
    case 'branch':
      return `${t('scope.branch')}: ${scope.value}`
    case 'personal':
      return `${t('scope.personal')}: ${scope.value}`
    default:
      return ''
  }
}

// Handle user selection
const selectUser = async (user) => {
  await userStore.switchUser(user.id)
  isOpen.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.user-selector')) {
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

<style scoped>
/* Mobile styles */
@media (max-width: 640px) {
  .user-selector {
    width: 100%;
    max-width: 100%;
    height: calc(100vh - 64px); /* Full height for mobile, minus navbar */
    overflow-y: auto; /* Allow scrolling */
  }
}
</style>
