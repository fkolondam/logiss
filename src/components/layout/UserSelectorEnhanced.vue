<template>
  <div class="relative user-selector">
    <!-- User Button with Role Indicator -->
    <button @click="isOpen = !isOpen" class="flex items-center gap-3 h-full relative group">
      <!-- Avatar with Role Border -->
      <div
        class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center relative"
        :class="[currentUser ? getRoleBorderClass(currentUser.role) : 'border-2 border-gray-300']"
      >
        <UserCircle
          class="w-4 h-4"
          :class="currentUser ? getRoleIconClass(currentUser.role) : 'text-gray-500'"
        />
        <!-- Role Level Indicator -->
        <div
          v-if="currentUser"
          class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-medium border-2 border-white"
          :class="getRoleLevelClass(currentUser.role)"
        >
          {{ getRoleLevelIcon(currentUser.role) }}
        </div>
      </div>

      <div class="hidden md:flex flex-col items-start">
        <span class="text-sm font-medium text-gray-900">{{ currentUserLabel }}</span>
        <span class="text-xs text-gray-500 flex items-center gap-1">
          <component :is="getCurrentScopeIcon" class="w-3 h-3" />
          {{ getScopeLabel(currentUser?.scope) }}
        </span>
      </div>

      <ChevronDown
        class="w-4 h-4 text-gray-500 hidden md:block transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />

      <!-- Tooltip on Hover -->
      <div
        class="absolute hidden group-hover:block top-full left-0 mt-1 w-48 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg"
      >
        <div class="font-medium">{{ t(`roles.${currentUser?.role || 'none'}`) }}</div>
        <div class="text-gray-300 text-[10px] mt-0.5">
          {{ t(`scope.level.${roles[currentUser?.role]?.level || 'none'}`) }}
        </div>
      </div>
    </button>

    <!-- Enhanced Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-[420px] bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      <!-- Search & Quick Filters -->
      <div class="p-4 border-b space-y-3">
        <!-- Search -->
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            class="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :placeholder="t('userSelector.searchPlaceholder')"
          />
        </div>

        <!-- Region Quick Filters -->
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="region in availableRegions"
            :key="region"
            @click="toggleRegionFilter(region)"
            :class="[
              'px-2 py-1 text-xs font-medium rounded-md transition-colors',
              activeRegionFilters.includes(region)
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            <Map class="w-3 h-3 inline-block mr-1" />
            {{ region }}
          </button>
        </div>

        <!-- Scope Type Filters -->
        <div class="flex gap-1.5">
          <button
            v-for="filter in scopeFilters"
            :key="filter.id"
            @click="toggleScopeFilter(filter.id)"
            :class="[
              'flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md transition-colors',
              activeScopeFilters.includes(filter.id)
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            <component :is="filter.icon" class="w-3 h-3" />
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- Current User Info -->
      <div v-if="currentUser" class="p-4 bg-blue-50/50 border-b">
        <div class="flex items-start gap-4">
          <!-- Avatar with Role Indicator -->
          <div class="relative">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center"
              :class="getRoleBackgroundClass(currentUser.role)"
            >
              <UserCircle class="w-6 h-6" :class="getRoleIconClass(currentUser.role)" />
            </div>
            <div
              class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white"
              :class="getRoleLevelClass(currentUser.role)"
            >
              {{ getRoleLevelIcon(currentUser.role) }}
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <div class="font-medium text-gray-900">{{ currentUser.name }}</div>
              <span
                :class="[
                  'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
                  getRoleBadgeClasses(currentUser.role),
                ]"
              >
                {{ t(`roles.${currentUser.role}`) }}
              </span>
            </div>
            <div class="text-sm text-gray-600 flex items-center gap-1.5 mt-0.5">
              <component :is="getCurrentScopeIcon" class="w-3.5 h-3.5" />
              {{ getScopeLabel(currentUser.scope) }}
            </div>

            <!-- Permission Summary -->
            <div class="mt-3 grid grid-cols-2 gap-3">
              <!-- Access Level -->
              <div class="bg-white rounded-md p-2 border">
                <div class="text-xs font-medium text-gray-500 mb-1.5">
                  {{ t('userSelector.accessLevel') }}
                </div>
                <div class="flex items-center gap-1.5">
                  <Layers class="w-4 h-4" :class="getRoleIconClass(currentUser.role)" />
                  <span class="text-sm font-medium" :class="getRoleTextClass(currentUser.role)">
                    {{ t(`scope.level.${roles[currentUser.role].level}`) }}
                  </span>
                </div>
              </div>

              <!-- Permission Count -->
              <div class="bg-white rounded-md p-2 border">
                <div class="text-xs font-medium text-gray-500 mb-1.5">
                  {{ t('userSelector.permissions') }}
                </div>
                <div class="flex items-center gap-1.5">
                  <Shield class="w-4 h-4" :class="getRoleIconClass(currentUser.role)" />
                  <span class="text-sm font-medium" :class="getRoleTextClass(currentUser.role)">
                    {{ getCurrentUserPermissions.length }} {{ t('userSelector.permissionsCount') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Permissions List -->
        <div class="mt-3">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="permission in getCurrentUserPermissions"
              :key="permission"
              class="inline-flex items-center px-2 py-0.5 text-xs bg-white text-gray-600 rounded-md border"
            >
              {{ t(`permissions.${permission}`) }}
            </span>
          </div>
        </div>
      </div>

      <!-- User List -->
      <div class="max-h-[calc(100vh-500px)] overflow-y-auto">
        <!-- Role Groups -->
        <div v-for="(users, role) in filteredUsersByRole" :key="role" class="py-2">
          <div
            class="px-4 py-2 text-xs font-medium text-gray-500 uppercase flex items-center justify-between bg-gray-50"
          >
            <div class="flex items-center gap-2">
              <span>{{ t(`roles.${role}`) }}</span>
              <span
                class="px-1.5 py-0.5 rounded-full text-[10px] bg-white border"
                :class="getRoleTextClass(role)"
              >
                {{ users.length }}
              </span>
            </div>
            <span class="text-xs normal-case text-gray-400">
              {{ t(`scope.level.${roles[role].level}`) }}
            </span>
          </div>

          <!-- User Cards -->
          <div class="space-y-0.5">
            <button
              v-for="user in users"
              :key="user.id"
              @click="selectUser(user)"
              class="w-full px-4 py-2 hover:bg-gray-50 transition-colors group"
              :class="[currentUser?.id === user.id ? 'bg-blue-50/50' : '']"
            >
              <div class="flex items-center gap-3">
                <!-- User Avatar with Role -->
                <div class="relative">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="getRoleBackgroundClass(user.role)"
                  >
                    <UserCircle class="w-4 h-4" :class="getRoleIconClass(user.role)" />
                  </div>
                  <div
                    class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-medium border-2 border-white"
                    :class="getRoleLevelClass(user.role)"
                  >
                    {{ getRoleLevelIcon(user.role) }}
                  </div>
                </div>

                <!-- User Info -->
                <div class="flex-1 min-w-0 text-left">
                  <div class="flex items-center gap-2">
                    <span
                      class="font-medium"
                      :class="currentUser?.id === user.id ? 'text-blue-700' : 'text-gray-900'"
                    >
                      {{ user.name }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-500 flex items-center gap-1.5">
                    <component :is="getScopeIcon(user.scope.type)" class="w-3.5 h-3.5" />
                    {{ getScopeLabel(user.scope) }}
                  </div>
                </div>

                <!-- Selection Indicator -->
                <div
                  v-if="currentUser?.id === user.id"
                  class="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center"
                >
                  <Check class="w-3 h-3 text-blue-600" />
                </div>
              </div>

              <!-- Hover Details -->
              <div
                class="mt-2 grid grid-cols-2 gap-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                :class="{ 'opacity-100': currentUser?.id === user.id }"
              >
                <!-- Permission Summary -->
                <div class="flex items-center gap-1.5 text-gray-500">
                  <Shield class="w-3.5 h-3.5" />
                  <span
                    >{{ getUserPermissions(user).length }}
                    {{ t('userSelector.permissionsCount') }}</span
                  >
                </div>
                <!-- Branch Count (for Regional Managers) -->
                <div
                  v-if="user.role === 'regional_manager'"
                  class="flex items-center gap-1.5 text-gray-500"
                >
                  <Building2 class="w-3.5 h-3.5" />
                  <span
                    >{{ getBranchCount(user.scope.value) }}
                    {{ t('scope.branches').toLowerCase() }}</span
                  >
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  UserCircle,
  ChevronDown,
  Search,
  Check,
  Shield,
  Layers,
  Map,
  Globe,
  Building2,
  Users,
} from 'lucide-vue-next'
import { useUserStore } from '../../stores/user'
import { predefinedUsers, roles } from '../../config/users'
import { branchConfig } from '../../services/mockdata/generators/branchData'
import { useTranslations } from '../../composables/useTranslations'

const userStore = useUserStore()
const { t } = useTranslations()

// UI State
const isOpen = ref(false)
const searchQuery = ref('')
const activeRegionFilters = ref([])
const activeScopeFilters = ref([])

// Available regions from branch config
const availableRegions = computed(() => [
  ...new Set(Object.values(branchConfig).map((b) => b.region)),
])

// Scope filters configuration
const scopeFilters = [
  { id: 'global', label: t('scope.global'), icon: Globe },
  { id: 'region', label: t('scope.region'), icon: Map },
  { id: 'branch', label: t('scope.branch'), icon: Building2 },
  { id: 'personal', label: t('scope.personal'), icon: Users },
]

// Current user from store
const currentUser = computed(() => userStore.currentUser)

// Computed label for current user
const currentUserLabel = computed(() => currentUser.value?.name || t('userSelector.selectUser'))

// Get current user's permissions
const getCurrentUserPermissions = computed(() => {
  if (!currentUser.value) return []
  return roles[currentUser.value.role].permissions
})

// Get current scope icon
const getCurrentScopeIcon = computed(() => {
  if (!currentUser.value?.scope) return Globe
  return getScopeIcon(currentUser.value.scope.type)
})

// Filter and group users
const filteredUsersByRole = computed(() => {
  let filtered = [...predefinedUsers]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        (user.scope.value || '').toLowerCase().includes(query),
    )
  }

  // Apply region filters
  if (activeRegionFilters.value.length > 0) {
    filtered = filtered.filter((user) => {
      if (user.scope.type === 'region') {
        return activeRegionFilters.value.includes(user.scope.value)
      }
      if (user.scope.type === 'branch') {
        const region = branchConfig[user.scope.value]?.region
        return activeRegionFilters.value.includes(region)
      }
      return true
    })
  }

  // Apply scope type filters
  if (activeScopeFilters.value.length > 0) {
    filtered = filtered.filter((user) => activeScopeFilters.value.includes(user.scope.type))
  }

  // Group by role
  return filtered.reduce((acc, user) => {
    if (!acc[user.role]) {
      acc[user.role] = []
    }
    acc[user.role].push(user)
    return acc
  }, {})
})

// Helper functions
const getUserPermissions = (user) => {
  return roles[user.role].permissions
}

const getBranchCount = (region) => {
  return Object.values(branchConfig).filter((b) => b.region === region).length
}

const getScopeIcon = (type) => {
  switch (type) {
    case 'global':
      return Globe
    case 'region':
      return Map
    case 'branch':
      return Building2
    case 'personal':
      return Users
    default:
      return Globe
  }
}

// Role-based styling
const getRoleBadgeClasses = (role) => {
  const classes = {
    admin: 'bg-purple-100 text-purple-700',
    regional_manager: 'bg-blue-100 text-blue-700',
    branch_manager: 'bg-green-100 text-green-700',
    staff: 'bg-orange-100 text-orange-700',
    operational: 'bg-gray-100 text-gray-700',
  }
  return classes[role] || 'bg-gray-100 text-gray-700'
}

const getRoleBorderClass = (role) => {
  const classes = {
    admin: 'border-2 border-purple-500',
    regional_manager: 'border-2 border-blue-500',
    branch_manager: 'border-2 border-green-500',
    staff: 'border-2 border-orange-500',
    operational: 'border-2 border-gray-500',
  }
  return classes[role] || 'border-2 border-gray-300'
}

const getRoleBackgroundClass = (role) => {
  const classes = {
    admin: 'bg-purple-100',
    regional_manager: 'bg-blue-100',
    branch_manager: 'bg-green-100',
    staff: 'bg-orange-100',
    operational: 'bg-gray-100',
  }
  return classes[role] || 'bg-gray-100'
}

const getRoleIconClass = (role) => {
  const classes = {
    admin: 'text-purple-600',
    regional_manager: 'text-blue-600',
    branch_manager: 'text-green-600',
    staff: 'text-orange-600',
    operational: 'text-gray-600',
  }
  return classes[role] || 'text-gray-600'
}

const getRoleTextClass = (role) => {
  const classes = {
    admin: 'text-purple-700',
    regional_manager: 'text-blue-700',
    branch_manager: 'text-green-700',
    staff: 'text-orange-700',
    operational: 'text-gray-700',
  }
  return classes[role] || 'text-gray-700'
}

const getRoleLevelClass = (role) => {
  const classes = {
    admin: 'bg-purple-600 text-white',
    regional_manager: 'bg-blue-600 text-white',
    branch_manager: 'bg-green-600 text-white',
    staff: 'bg-orange-600 text-white',
    operational: 'bg-gray-600 text-white',
  }
  return classes[role] || 'bg-gray-600 text-white'
}

const getRoleLevelIcon = (role) => {
  const level = roles[role]?.level
  switch (level) {
    case 'global':
      return 'G'
    case 'region':
      return 'R'
    case 'branch':
      return 'B'
    case 'personal':
      return 'P'
    default:
      return '-'
  }
}

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

// Toggle filters
const toggleRegionFilter = (region) => {
  const index = activeRegionFilters.value.indexOf(region)
  if (index === -1) {
    activeRegionFilters.value.push(region)
  } else {
    activeRegionFilters.value.splice(index, 1)
  }
}

const toggleScopeFilter = (scopeType) => {
  const index = activeScopeFilters.value.indexOf(scopeType)
  if (index === -1) {
    activeScopeFilters.value.push(scopeType)
  } else {
    activeScopeFilters.value.splice(index, 1)
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
